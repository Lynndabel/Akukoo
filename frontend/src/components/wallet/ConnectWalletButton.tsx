'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount, useDisconnect, useSwitchChain, useConnect } from 'wagmi';
import { liskSepolia } from 'wagmi/chains';
import { toast } from 'react-hot-toast';

export function ConnectWalletButton() {
  const { isConnected, address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { connect, connectors } = useConnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  
  const walletConnectConnector = connectors.find(c => c.id === 'walletConnect');


  // Close account menu on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  // Auto switch to Lisk after successful connect
  useEffect(() => {
    if (!isConnected) return;
    if (chain?.id !== liskSepolia.id) {
      try { 
        switchChain({ chainId: liskSepolia.id }); 
      } catch (error) {
        console.error('Failed to switch to Lisk Sepolia:', error);
      }
    }
  }, [isConnected, chain?.id, switchChain]);

  if (isConnected && address) {
    return (
      <div className="relative" ref={popoverRef}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="px-3 py-1 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
        >
          {address.slice(0, 6)}...{address.slice(-4)}{chain ? ` · ${chain.name}` : ''}
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-md border border-neutral-700 bg-neutral-900 shadow-lg z-50">
            <button
              onClick={() => { setMenuOpen(false); disconnect(); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-800"
            >
              Disconnect
            </button>
            <button
              onClick={() => { setMenuOpen(false); try { switchChain({ chainId: liskSepolia.id }); } catch {} }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-800"
            >
              Switch to Lisk Sepolia
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={async () => {
          if (isConnected) {
            setMenuOpen(!menuOpen);
          } else if (walletConnectConnector) {
            try {
              setIsConnecting(true);
              connect({ connector: walletConnectConnector });
            } catch (error) {
              console.error('Failed to connect wallet:', error);
              toast.error('Failed to connect wallet');
            } finally {
              setIsConnecting(false);
            }
          }
        }}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        aria-haspopup="dialog"
        disabled={isConnecting}
      >
        {isConnected ? 
          `${address?.substring(0, 6)}...${address?.substring(address.length - 4)}` : 
          isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      {menuOpen && isConnected && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg py-1 z-50">
          <button
            onClick={() => {
              disconnect();
              setMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}


