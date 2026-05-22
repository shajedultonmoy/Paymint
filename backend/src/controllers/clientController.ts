import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import { ClientModel } from '../models/clientModel';
import { AuthRequest } from '../middleware/authMiddleware';

export const getClients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const clients = await ClientModel.findByUser(req.user!.id);
  res.json(clients);
});

export const createClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.body.clientName && !req.body.name) {
    res.status(400);
    throw new Error('Client name is required');
  }

  const client = await ClientModel.create(req.user!.id, req.body);
  res.status(201).json(client);
});

export const getClientById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const client = await ClientModel.findOwnedById(String(req.params.id), req.user!.id);

  if (!client) {
    res.status(404);
    throw new Error('Client not found or not authorized');
  }

  res.json(client);
});

export const updateClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.body.clientName && !req.body.name) {
    res.status(400);
    throw new Error('Client name is required');
  }

  const client = await ClientModel.update(String(req.params.id), req.user!.id, req.body);
  if (!client) {
    res.status(404);
    throw new Error('Client not found or not authorized');
  }

  res.json(client);
});

export const deleteClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const removed = await ClientModel.remove(String(req.params.id), req.user!.id);
  if (!removed) {
    res.status(404);
    throw new Error('Client not found or not authorized');
  }

  res.json({ message: 'Client removed' });
});
