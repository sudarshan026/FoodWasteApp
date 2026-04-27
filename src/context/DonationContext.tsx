import React, { createContext, useContext, useState, useCallback } from 'react';
import { Donation, DonationItem } from '../models/types';
import { DonationService } from '../services/donationService';
import { useAuth } from './AuthContext';

interface DonationContextType {
  donations: Donation[];
  isLoading: boolean;
  loadDonations: () => Promise<void>;
  createDonation: (items: DonationItem[], ngoId: string, ngoName: string) => Promise<Donation>;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export const DonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDonations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userDonations = await DonationService.getDonations(user.id);
      setDonations(userDonations);
    } catch (error) {
      console.error('Load donations error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createDonation = useCallback(async (
    items: DonationItem[],
    ngoId: string,
    ngoName: string
  ): Promise<Donation> => {
    if (!user) throw new Error('Not authenticated');
    const donation = await DonationService.createDonation(user.id, items, ngoId, ngoName);
    await loadDonations();
    return donation;
  }, [user, loadDonations]);

  return (
    <DonationContext.Provider
      value={{
        donations,
        isLoading,
        loadDonations,
        createDonation,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};

export const useDonation = (): DonationContextType => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
};
