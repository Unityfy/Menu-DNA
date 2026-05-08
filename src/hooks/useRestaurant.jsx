import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';
import {
  computeDishMetrics,
  classifyDishes,
  computeIntelligenceScore,
  computePortfolioSummary,
  generateRecommendations,
} from '../lib/menuAnalytics';
import { normalizeRow } from '../lib/posParser.js';

export function useRestaurant() {
  const { user } = useAuth();
  const [uploads,       setUploads]      = useState([]);
  const [currentMenu,   setCurrentMenu]  = useState([]);
  const [summary,       setSummary]      = useState(null);
  const [recommendations, setRecs]       = useState([]);
  const [loading,       setLoading]      = useState(false);
  const [error,         setError]        = useState(null);

  // ── Load existing menu data ────────────────────────────────────────
  const loadMenuData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('menu_data')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (err) throw err;
      processAndSetDishes(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadMenuData();
  }, [user, loadMenuData]);

  // ── Process raw dishes through analytics pipeline ──────────────────
  function processAndSetDishes(rawDishes) {
    const withMetrics    = rawDishes.map(computeDishMetrics);
    const withClass      = classifyDishes(withMetrics);
    const withScore      = computeIntelligenceScore(withClass);
    const portfolioSummary = computePortfolioSummary(withScore);
    const recs           = generateRecommendations(withScore);

    setCurrentMenu(withScore);
    setSummary(portfolioSummary);
    setRecs(recs);
  }

  // ── Save dishes from CSV upload to Supabase (replaces all) ──────────
  const saveMenuData = useCallback(async (dishes, fileName) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Clear existing menu data for this user
      const { error: deleteErr } = await supabase
        .from('menu_data')
        .delete()
        .eq('user_id', user.id);

      if (deleteErr) throw deleteErr;

      // Insert new dishes with user_id
      const dishesWithUserId = dishes.map(dish => ({
        ...dish,
        user_id: user.id,
        uploaded_at: new Date().toISOString(),
      }));

      const { error: insertErr } = await supabase
        .from('menu_data')
        .insert(dishesWithUserId);

      if (insertErr) throw insertErr;

      // Log upload
      const { error: uploadLogErr } = await supabase
        .from('uploads')
        .insert([{
          user_id: user.id,
          file_name: fileName,
          dish_count: dishes.length,
          uploaded_at: new Date().toISOString(),
        }]);

      if (uploadLogErr) throw uploadLogErr;

      processAndSetDishes(dishes);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Add items to existing menu (append/upsert, doesn't clear) ─────
  const addMenuItems = useCallback(async (newDishes) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch current menu data from DB
      const { data: existingData, error: fetchErr } = await supabase
        .from('menu_data')
        .select('*')
        .eq('user_id', user.id);

      if (fetchErr) throw fetchErr;

      const existing = existingData || [];

      // Build a map of existing dishes by name (case-insensitive)
      const existingMap = new Map();
      existing.forEach(d => existingMap.set(d.name.toLowerCase(), d));

      // Separate updates vs inserts
      const toUpdate = [];
      const toInsert = [];

      for (const dish of newDishes) {
        const key = dish.name.toLowerCase();
        if (existingMap.has(key)) {
          toUpdate.push({ ...dish, id: existingMap.get(key).id });
        } else {
          toInsert.push(dish);
        }
      }

      // Update existing dishes
      for (const dish of toUpdate) {
        const { id, ...fields } = dish;
        const { error: upErr } = await supabase
          .from('menu_data')
          .update({
            category: fields.category,
            price: fields.price,
            cost: fields.cost,
            unitsSold: fields.unitsSold,
            prepTime: fields.prepTime,
            uploaded_at: new Date().toISOString(),
          })
          .eq('id', id);
        if (upErr) throw upErr;
      }

      // Insert new dishes
      if (toInsert.length > 0) {
        const withUserId = toInsert.map(dish => ({
          ...dish,
          user_id: user.id,
          uploaded_at: new Date().toISOString(),
        }));

        const { error: insertErr } = await supabase
          .from('menu_data')
          .insert(withUserId);
        if (insertErr) throw insertErr;
      }

      // Log the addition
      const { error: logErr } = await supabase
        .from('uploads')
        .insert([{
          user_id: user.id,
          file_name: `Manual — ${newDishes.length} item${newDishes.length > 1 ? 's' : ''}`,
          dish_count: newDishes.length,
          uploaded_at: new Date().toISOString(),
        }]);
      if (logErr) throw logErr;

      // Reload all menu data and reprocess
      await loadMenuData();
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user, loadMenuData]);

  // ── Load upload history ────────────────────────────────────────────
  const loadUploads = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error: err } = await supabase
        .from('uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (err) throw err;
      setUploads(data || []);
    } catch (e) {
      setError(e.message);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadUploads();
  }, [user, loadUploads]);

  return {
    uploads,
    currentMenu,
    summary,
    recommendations,
    loading,
    error,
    saveMenuData,
    addMenuItems,
    loadMenuData,
    loadUploads,
  };
}
