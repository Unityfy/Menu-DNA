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

  // ── Save dishes from CSV upload to Supabase ────────────────────────
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
    loadMenuData,
    loadUploads,
  };
}
