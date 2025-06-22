import { createDojoConfig } from "@dojoengine/core";

import manifest from "../../../manifest_dev.json";

export const dojoConfig = createDojoConfig({
    masterAddress: "0x6677fe62ee39c7b07401f754138502bab7fac99d2d3c5d37df7d1c6fab10819",
    masterPrivateKey: "0x3e3979c1ed728490308054fe357a9f49cf67f80f9721f44cc57235129e090f4",
    accountClassHash: "0x07dc7899aa655b0aae51eadff6d801a58e97dd99cf4666ee59e704249e51adf2",
    feeTokenAddress: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    manifest,

});    
