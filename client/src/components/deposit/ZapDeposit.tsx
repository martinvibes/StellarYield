import { useState } from "react";
import { ArrowDown, Zap, Loader2, AlertTriangle } from "lucide-react";

interface ZapDepositProps {
  walletAddress: string | null;
  onDeposit?: (inputToken: string, amount: string, slippage: number) => Promise<void>;
}

const SUPPORTED_TOKENS = [
  { symbol: "XLM", name: "Stellar Lumens", icon: "X" },
  { symbol: "USDC", name: "USD Coin", icon: "$" },
  { symbol: "AQUA", name: "Aquarius", icon: "A" },
];

const VAULT_TOKEN = "USDC";

export default function ZapDeposit({ walletAddress, onDeposit }: ZapDepositProps) {
  const [inputToken, setInputToken] = useState("XLM");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const needsSwap = inputToken !== VAULT_TOKEN;

  const handleDeposit = async () => {
    if (!walletAddress || !amount || parseFloat(amount) <= 0) return;

    setStatus("loading");
    setError("");

    try {
      if (onDeposit) {
        await onDeposit(inputToken, amount, slippage);
      }
      setStatus("success");
      setAmount("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  if (!walletAddress) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
        <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Zap Deposit</h3>
        <p className="text-gray-400">Connect your wallet to make a deposit</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">Zap Deposit</h3>
      </div>

      {/* Input Token */}
      <div className="bg-white/5 rounded-xl p-4 mb-2">
        <label className="text-sm text-gray-400 mb-2 block">You pay</label>
        <div className="flex gap-3">
          <select
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/10"
          >
            {SUPPORTED_TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-white text-right text-2xl outline-none"
          />
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center my-2">
        <div className="bg-white/10 rounded-full p-2">
          <ArrowDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Output (Vault Token) */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <label className="text-sm text-gray-400 mb-2 block">
          {needsSwap ? "Swapped & deposited into vault" : "Deposited into vault"}
        </label>
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">{VAULT_TOKEN} Vault</span>
          <span className="text-gray-400 text-sm">
            {needsSwap ? "Auto-swap via DEX" : "Direct deposit"}
          </span>
        </div>
      </div>

      {/* Slippage */}
      {needsSwap && (
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Slippage tolerance</span>
            <span className="text-sm text-white">{slippage}%</span>
          </div>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`flex-1 py-1 rounded-lg text-sm ${
                  slippage === s
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-gray-400 hover:bg-white/20"
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleDeposit}
        disabled={!amount || parseFloat(amount) <= 0 || status === "loading"}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : status === "success" ? (
          "Deposit Successful!"
        ) : needsSwap ? (
          <>
            <Zap className="w-4 h-4" />
            Zap Deposit
          </>
        ) : (
          "Deposit"
        )}
      </button>

      {needsSwap && (
        <p className="text-xs text-gray-500 text-center mt-3">
          Your {inputToken} will be swapped for {VAULT_TOKEN} and deposited in one transaction
        </p>
      )}
    </div>
  );
}
