import _ from "lodash";
import { D2Api } from "../types/d2-api";

export function getMajorVersion(version: string): number {
    const apiVersion = _.get(version.split("."), 1);
    if (!apiVersion) throw new Error(`Invalid version: ${version}`);
    return Number(apiVersion);
}

export function getD2APiFromInstance(instance: DhisInstance) {
    const auth =
        instance.type === "external" ? { username: instance.username, password: instance.password } : undefined;

    return new D2Api({ baseUrl: instance.url, auth, backend: "fetch" });
}

export type DhisInstance =
    | {
          type: "local";
          url: string;
      }
    | {
          type: "external";
          url: string;
          username: string;
          password: string;
      };
