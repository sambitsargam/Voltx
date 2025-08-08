import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, formatTokenAmount, ERROR_MESSAGES } from '../utils/contract';

export function useRECContract(account, isValidConnection) {
  const [contract, setContract] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [retiredBalance, setRetiredBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [totalRetired, setTotalRetired] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      if (!isValidConnection || !CONTRACT_CONFIG.address) {
        setContract(null);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          CONTRACT_CONFIG.address,
          CONTRACT_CONFIG.abi,
          signer
        );
        
        setContract(contractInstance);
        setError('');
      } catch (err) {
        console.error('Failed to initialize contract:', err);
        setError(ERROR_MESSAGES.CONTRACT_NOT_FOUND);
      }
    };

    initContract();
  }, [isValidConnection, account]);

  // Load contract data
  const loadContractData = async () => {
    if (!contract || !account) return;

    try {
      setIsLoading(true);
      
      const [balance, retired, supply, totalRet] = await Promise.all([
        contract.balanceOf(account),
        contract.getRetiredBalance(account),
        contract.totalSupply(),
        contract.totalRetired()
      ]);

      setTokenBalance(formatTokenAmount(balance.toString()));
      setRetiredBalance(formatTokenAmount(retired.toString()));
      setTotalSupply(formatTokenAmount(supply.toString()));
      setTotalRetired(formatTokenAmount(totalRet.toString()));
    } catch (err) {
      console.error('Failed to load contract data:', err);
      setError('Failed to load contract data');
    } finally {
      setIsLoading(false);
    }
  };

  // Mint RECs (owner only)
  const mintREC = async (to, amountMWh, facilityId) => {
    if (!contract) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);

    try {
      setIsLoading(true);
      const metadata = `Minted on ${new Date().toISOString()}`; // Generation metadata
      
      const tx = await contract.mintFromFacility(to, amountMWh, facilityId, metadata);
      await tx.wait();
      
      // Reload data after successful mint
      await loadContractData();
      
      return tx.hash;
    } catch (err) {
      console.error('Failed to mint REC:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Retire RECs
  const retireREC = async (amount, reason) => {
    if (!contract) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);

    try {
      setIsLoading(true);
      const amountWei = ethers.parseEther(amount.toString());
      
      const tx = await contract.retireTokens(amountWei, reason);
      await tx.wait();
      
      // Reload data after successful retirement
      await loadContractData();
      
      return tx.hash;
    } catch (err) {
      console.error('Failed to retire REC:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register facility (owner only)
  const registerFacility = async (facilityId, name, location, energyType, capacity) => {
    if (!contract) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);

    try {
      setIsLoading(true);
      
      const tx = await contract.registerFacility(facilityId, name, location, energyType, capacity);
      await tx.wait();
      
      return tx.hash;
    } catch (err) {
      console.error('Failed to register facility:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get facility info
  const getFacility = async (facilityId) => {
    if (!contract) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);

    try {
      const facility = await contract.getFacility(facilityId);
      return {
        facilityId: facility[0],
        owner: facility[1],
        facilityType: facility[2],
        isActive: facility[3],
        totalGenerated: parseInt(facility[4]),
        registrationDate: new Date(parseInt(facility[5]) * 1000)
      };
    } catch (err) {
      console.error('Failed to get facility:', err);
      throw err;
    }
  };

  // Transfer tokens
  const transferTokens = async (to, amount) => {
    if (!contract) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);

    try {
      setIsLoading(true);
      const amountWei = ethers.parseEther(amount.toString());
      
      const tx = await contract.transfer(to, amountWei);
      await tx.wait();
      
      // Reload data after successful transfer
      await loadContractData();
      
      return tx.hash;
    } catch (err) {
      console.error('Failed to transfer tokens:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is contract owner
  const isOwner = async () => {
    if (!contract || !account) return false;

    try {
      const owner = await contract.owner();
      return owner.toLowerCase() === account.toLowerCase();
    } catch (err) {
      console.error('Failed to check owner:', err);
      return false;
    }
  };

  // Load data when contract is initialized
  useEffect(() => {
    if (contract && account) {
      loadContractData();
    }
  }, [contract, account]);

  return {
    contract,
    tokenBalance,
    retiredBalance,
    totalSupply,
    totalRetired,
    isLoading,
    error,
    loadContractData,
    mintREC,
    retireREC,
    registerFacility,
    getFacility,
    transferTokens,
    isOwner
  };
}
