import { Request, Response } from 'express';
import { supabase } from '../supabase.js';

export const getAll = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const {id } = req.params;
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    // Destructure association arrays out of the main user data
    const { club_ids, ...userData } = req.body;

    // 1. Insert the main user record
    const { data: newUser, error: userError } = await supabase.from('users').insert(userData).select().single();
    if (userError) throw userError;

    // 2. Insert into linked tables based on the provided specifications
    if (club_ids && Array.isArray(club_ids) && club_ids.length > 0) {
      const userClubs = club_ids.map((club_id: number) => ({
        user_id: newUser.id,
        club_id
      }));

      const { error: clubsError } = await supabase.from('user_clubs').insert(userClubs);
      if (clubsError) throw clubsError;
    }

    // You can easily follow this pattern for other linked tables (e.g., interests, courses) here!

    res.status(201).json({ data: newUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('users').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
