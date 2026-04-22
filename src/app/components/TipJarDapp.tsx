"use client";

import { useMemo, useState } from "react";
import { contract } from "@/contract";
import { formatEther, isAddress, parseEther } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { sepolia } from "wagmi/chains";

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function TipJarDapp() {
  const [tipAmount, setTipAmount] = useState("0.001");
  const [searchAddress, setSearchAddress] = useState("");

  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting, error: connectError } =
    useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isOnSepolia = chainId === sepolia.id;

  const { data: owner, refetch: refetchOwner } = useReadContract({
    ...contract,
    functionName: "owner",
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...contract,
    functionName: "getBalance",
  });

  const { data: myTips, refetch: refetchMyTips } = useReadContract({
    ...contract,
    functionName: "getTipAmount",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const validSearchAddress = useMemo(() => {
    return isAddress(searchAddress) ? searchAddress : undefined;
  }, [searchAddress]);

  const { data: searchedTipAmount, refetch: refetchSearchedTipAmount } =
    useReadContract({
      ...contract,
      functionName: "getTipAmount",
      args: validSearchAddress ? [validSearchAddress] : undefined,
      query: {
        enabled: !!validSearchAddress,
      },
    });

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWriting,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const isOwner =
    !!address &&
    !!owner &&
    address.toLowerCase() === String(owner).toLowerCase();

  const refreshAll = async () => {
    await Promise.all([
      refetchOwner(),
      refetchBalance(),
      refetchMyTips(),
      validSearchAddress ? refetchSearchedTipAmount() : Promise.resolve(),
    ]);
  };

  const handleTip = () => {
    if (!tipAmount || Number(tipAmount) <= 0) {
      alert("팁 금액을 0보다 크게 입력하세요.");
      return;
    }

    writeContract({
      ...contract,
      functionName: "tip",
      value: parseEther(tipAmount),
    });
  };

  const handleWithdraw = () => {
    writeContract({
      ...contract,
      functionName: "withdrawTips",
    });
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">TipJar DApp</h1>
          <p className="mt-2 text-sm text-zinc-600">
            wagmi + viem 기반 Sepolia TipJar 프런트엔드
          </p>
          <p className="mt-2 break-all text-sm text-zinc-600">
            컨트랙트 주소: {contract.address}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">지갑 연결</h2>

          {!isConnected ? (
            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="rounded-lg bg-black px-4 py-2 text-white"
                  disabled={isConnecting}
                >
                  {connector.name} 연결
                </button>
              ))}
              {connectError && (
                <p className="text-sm text-red-600 break-all">
                  {connectError.message}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p>
                연결 주소: <strong>{shortAddress(address)}</strong>
              </p>
              <p>
                현재 네트워크:{" "}
                <strong>{isOnSepolia ? "Sepolia" : `Chain ID ${chainId}`}</strong>
              </p>

              {!isOnSepolia && (
                <button
                  onClick={() => switchChain({ chainId: sepolia.id })}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-white"
                  disabled={isSwitching}
                >
                  Sepolia로 전환
                </button>
              )}

              <button
                onClick={() => disconnect()}
                className="rounded-lg bg-zinc-700 px-4 py-2 text-white"
              >
                연결 해제
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Owner</h3>
            <p className="mt-2 break-all text-sm text-zinc-700">
              {owner ? String(owner) : "불러오는 중..."}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">컨트랙트 잔액</h3>
            <p className="mt-2 text-xl font-bold">
              {balance ? `${formatEther(balance)} ETH` : "0 ETH"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">내 누적 팁 금액</h3>
            <p className="mt-2 text-xl font-bold">
              {myTips ? `${formatEther(myTips)} ETH` : "0 ETH"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">팁 보내기</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="0.001"
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 outline-none"
            />

            <button
              onClick={handleTip}
              disabled={!isConnected || !isOnSepolia || isWriting || isConfirming}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              팁 보내기
            </button>
          </div>

          <p className="mt-3 text-sm text-zinc-600">
            입력값은 ETH 단위입니다. 예: 0.001
          </p>

          {writeError && (
            <p className="mt-3 break-all text-sm text-red-600">
              에러: {writeError.message}
            </p>
          )}

          {isWriting && (
            <p className="mt-3 text-sm text-zinc-600">지갑 승인 대기 중...</p>
          )}

          {isConfirming && (
            <p className="mt-3 text-sm text-zinc-600">
              트랜잭션 처리 중...
            </p>
          )}

          {isConfirmed && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-green-600">트랜잭션이 완료되었습니다.</p>
              <button
                onClick={refreshAll}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
              >
                최신 정보 새로고침
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">특정 주소 누적 팁 조회</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 outline-none"
            />
            <button
              onClick={() => refetchSearchedTipAmount()}
              disabled={!validSearchAddress}
              className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              조회
            </button>
          </div>

          {searchAddress && !validSearchAddress && (
            <p className="mt-3 text-sm text-red-600">
              올바른 주소 형식이 아닙니다.
            </p>
          )}

          {validSearchAddress && (
            <p className="mt-4 text-sm text-zinc-700 break-all">
              조회 주소 <strong>{validSearchAddress}</strong> 의 누적 팁 금액:{" "}
              <strong>
                {searchedTipAmount
                  ? `${formatEther(searchedTipAmount)} ETH`
                  : "0 ETH"}
              </strong>
            </p>
          )}
        </div>

        {isOwner && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Owner 기능</h2>
            <button
              onClick={handleWithdraw}
              disabled={!isConnected || !isOnSepolia || isWriting || isConfirming}
              className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
            >
              팁 인출하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}