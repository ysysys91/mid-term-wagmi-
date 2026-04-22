import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia } from "wagmi/chains";

const sepoliaRpc =
  typeof process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL === "string" &&
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL.length > 0
    ? process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
    : undefined;

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(sepoliaRpc),
  },
  ssr: true,
});