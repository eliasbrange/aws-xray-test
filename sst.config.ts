import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "xray-test",
      region: "eu-west-1",
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      nodejs: {
        esbuild: {
          minify: true,
        },
      },
    });
    app.stack(API);
  },
} satisfies SSTConfig;
