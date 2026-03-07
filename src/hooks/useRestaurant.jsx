import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, getDocs, addDoc, deleteDoc,
  query, orderBy, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
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

  const uploadsRef = user
    ? collection(db, 'users', user.uid, 'uploads')
    : null;

  const menuRef = user
    ? collection(db, 'users', user.uid, 'menu_data')
    : null;

  // ── Load existing menu data ────────────────────────────────────────
  const loadMenuData = useCallback(async () => {
    if (!menuRef) return;
    setLoading(true);
    try {
      const q    = query(menuRef, orderBy('name'));
      const snap = await getDocs(q);
      const raw  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      processAndSetDishes(raw);
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

  // ── Save dishes from CSV upload to Firestore ───────────────────────
  const saveMenuData = useCallback(async (dishes, fileName) => {
    if (!user || !menuRef) return;
    setLoading(true);
    setError(null);
    try {
      // Clear existing and rewrite (full refresh for MVP)
      const snap = await getDocs(menuRef);
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));

      // Insert new dishes
      await Promise.all(
        dishes.map(dish =>
          addDoc(menuRef, {
            ...dish,
            uploadedAt: new Date().toISOString(),
          })
        )
      );

      // Log upload
      if (uploadsRef) {
        await addDoc(uploadsRef, {
          fileName,
          dishCount:   dishes.length,
          uploadedAt:  serverTimestamp(),
        });
      }

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
    if (!uploadsRef) return;
    try {
      const q    = query(uploadsRef, orderBy('uploadedAt', 'desc'));
      const snap = await getDocs(q);
      setUploads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
