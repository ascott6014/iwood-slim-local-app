import { Request, Response } from "express";
import { getInstallSummaries, getOrderSummaries, getRepairSummaries } from "../models/summaryModel";

export async function handleGetOrderSummaries(req: Request, res: Response): Promise<void> {
  try {
    const customerId = req.query.customer_id ? parseInt(req.query.customer_id as string) : undefined;
    const summaries = await getOrderSummaries(customerId);
    res.status(200).json(summaries);
  } catch (error) {
    console.error('Error fetching order summaries:', error);
    res.status(500).json({ message: 'Unable to fetch order summaries', error });
  }
}

export async function handleGetRepairSummaries(req: Request, res: Response): Promise<void> {
  try {
    const customerId = req.query.customer_id ? parseInt(req.query.customer_id as string) : undefined;
    const summaries = await getRepairSummaries(customerId);
    res.status(200).json(summaries);
  } catch (error) {
    console.error('Error fetching repair summaries:', error);
    res.status(500).json({ message: 'Unable to fetch repair summaries', error });
  }
}

export async function handleGetInstallSummaries(req: Request, res: Response): Promise<void> {
  try {
    const customerId = req.query.customer_id ? parseInt(req.query.customer_id as string) : undefined;
    const summaries = await getInstallSummaries(customerId);
    res.status(200).json(summaries);
  } catch (error) {
    console.error('Error fetching install summaries:', error);
    res.status(500).json({ message: 'Unable to fetch install summaries', error });
  }
}