// TypeScript declarations for window.adena
declare global {
  interface Window {
    adena?: {
      AddEstablish: (appName: string) => Promise<{ status: string; type: string; message?: string }>;
      GetAccount: () => Promise<{
        status: string;
        data?: {
          address: string;
          coins: string;
          publicKey: { type: string; value: string };
          status: string;
        };
        message?: string;
      }>;
      DoContract: (params: {
        messages: Array<{
          type: string;
          value: {
            caller: string;
            send: string;
            pkg_path: string;
            func: string;
            args: string[];
          };
        }>;
        gasFee?: number;
        gasWanted?: number;
        memo?: string;
      }) => Promise<{
        status: string;
        data?: {
          hash: string;
          height: number;
        };
        message?: string;
      }>;
      SwitchNetwork?: (chainId: string) => Promise<any>;
      On?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export function isAdenaInstalled(): boolean {
  return typeof window !== 'undefined' && Boolean(window.adena);
}

export async function connectAdenaWallet(): Promise<{ address: string } | null> {
  if (!isAdenaInstalled()) {
    const install = window.confirm(
      'Ekstensi Adena Wallet belum terpasang di browser Anda!\n\nApakah Anda ingin membuka situs https://adena.app/ untuk memasangnya?'
    );
    if (install) {
      window.open('https://adena.app/', '_blank');
    }
    return null;
  }

  try {
    // 1. Trigger the Adena permission popup to approve connection
    const establishRes = await window.adena!.AddEstablish('KewrChess');
    if (establishRes.status !== 'success' && establishRes.type !== 'ALREADY_CONNECTED') {
      console.warn('Adena connection rejected or failed:', establishRes);
      return null;
    }

    // 2. Fetch the connected account address
    const accountRes = await window.adena!.GetAccount();
    if (accountRes.status === 'success' && accountRes.data?.address) {
      return { address: accountRes.data.address };
    }

    return null;
  } catch (error) {
    console.error('Error connecting to Adena wallet:', error);
    throw error;
  }
}

export async function getConnectedAdenaAccount(): Promise<string | null> {
  if (!isAdenaInstalled()) return null;
  try {
    const res = await window.adena!.GetAccount();
    if (res.status === 'success' && res.data?.address) {
      return res.data.address;
    }
  } catch {
    // Not connected yet or error
  }
  return null;
}

export async function sendAdenaContractCall(
  caller: string,
  pkgPath: string,
  func: string,
  args: string[]
): Promise<any> {
  if (!isAdenaInstalled()) {
    throw new Error('Adena wallet tidak terpasang.');
  }

  const txParams = {
    messages: [
      {
        type: '/vm.m_call',
        value: {
          caller,
          send: '',
          pkg_path: pkgPath,
          func,
          args,
        },
      },
    ],
    gasFee: 1000000,
    gasWanted: 3000000,
  };

  return await window.adena!.DoContract(txParams);
}

export const KEWRCHESS_REALM_PKG = 'gno.land/r/g1g7dna0gp4nec5rza4q25htj0cjgswrxefp37ep/kewrchess';

export async function joinQueueOnChain(caller: string): Promise<any> {
  return await sendAdenaContractCall(caller, KEWRCHESS_REALM_PKG, 'JoinQueue', [caller]);
}

export async function leaveQueueOnChain(caller: string): Promise<any> {
  return await sendAdenaContractCall(caller, KEWRCHESS_REALM_PKG, 'LeaveQueue', [caller]);
}

export async function settleGameOnChain(
  caller: string,
  gameId: number,
  movesUCI: string
): Promise<any> {
  return await sendAdenaContractCall(
    caller,
    KEWRCHESS_REALM_PKG,
    'SettleGame',
    [caller, gameId.toString(), movesUCI]
  );
}

export async function proposeSettlementOnChain(
  caller: string,
  gameId: number,
  movesUCI: string
): Promise<any> {
  return await sendAdenaContractCall(
    caller,
    KEWRCHESS_REALM_PKG,
    'ProposeSettlement',
    [caller, gameId.toString(), movesUCI]
  );
}

export async function confirmSettlementOnChain(
  caller: string,
  gameId: number
): Promise<any> {
  return await sendAdenaContractCall(
    caller,
    KEWRCHESS_REALM_PKG,
    'ConfirmSettlement',
    [caller, gameId.toString()]
  );
}

export async function disputeSettlementOnChain(
  caller: string,
  gameId: number
): Promise<any> {
  return await sendAdenaContractCall(
    caller,
    KEWRCHESS_REALM_PKG,
    'DisputeSettlement',
    [caller, gameId.toString()]
  );
}

export async function finalizeSettlementOnChain(
  caller: string,
  gameId: number
): Promise<any> {
  return await sendAdenaContractCall(
    caller,
    KEWRCHESS_REALM_PKG,
    'FinalizeSettlement',
    [caller, gameId.toString()]
  );
}

export async function startTurnTimerOnChain(
  caller: string,
  gameId: number,
  currentMovesUCI: string
): Promise<any> {
  return await sendAdenaContractCall(
    caller,
    KEWRCHESS_REALM_PKG,
    'StartTurnTimer',
    [caller, gameId.toString(), currentMovesUCI]
  );
}

export async function claimTimeoutOnChain(
  caller: string,
  gameId: number
): Promise<any> {
  return await sendAdenaContractCall(
    caller,
    KEWRCHESS_REALM_PKG,
    'ClaimTimeout',
    [caller, gameId.toString()]
  );
}


