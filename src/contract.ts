export const contract = {
  address: "0xB36ef7737DD790d27C2dB647097e5049e91c6B1B" as const,
  abi: [
    {
      type: "function",
      name: "owner",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "address" }],
    },
    {
      type: "function",
      name: "tip",
      stateMutability: "payable",
      inputs: [],
      outputs: [],
    },
    {
      type: "function",
      name: "withdrawTips",
      stateMutability: "nonpayable",
      inputs: [],
      outputs: [],
    },
    {
      type: "function",
      name: "getBalance",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      type: "function",
      name: "getTipAmount",
      stateMutability: "view",
      inputs: [{ name: "user", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      type: "function",
      name: "getMyTips",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "uint256" }],
    },
  ],
} as const;