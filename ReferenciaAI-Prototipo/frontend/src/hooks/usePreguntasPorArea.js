import { useState, useEffect } from 'react';
const BASE_URL = import.meta.env.VITE_API_URL || '';

export function usePreguntasPorArea(area) {
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!area) {
      setPreguntas([]);
      return;
    }

    const fetchPreguntas = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BASE_URL}/api/v1/preguntas/${encodeURIComponent(area)}`);
        if (!response.ok) {
          throw new Error('Error al obtener las preguntas');
        }
        const data = await response.json();
        setPreguntas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPreguntas();
  }, [area]);

  const togglePreguntaActiva = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/preguntas/${id}/toggle`, {
        method: 'PUT'
      });
      if (response.ok) {
        const updatedPregunta = await response.json();
        setPreguntas(prev => prev.map(p => p.id === id ? { ...p, activa: updatedPregunta.activa } : p));
      }
    } catch (err) {
      console.error('Error toggling pregunta:', err);
    }
  };

  return { preguntas, loading, error, togglePreguntaActiva };
}
