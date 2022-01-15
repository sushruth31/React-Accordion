import axios from "axios";
import { useContext } from "react";
import { DataStoreContext } from "../datastore";
import { useAsync } from "./useAsync";

export function useFetchwStore(url, store, dispatcher, dependencies = [], object = true) {
  const { axiosheaders } = useContext(DataStoreContext);
  return useAsync(() => {
    if (object && Object.keys(store).length > 0) {
      return Promise.resolve();
    } else if (store.length > 0) {
      return Promise.resolve();
    }

    return axios.get(url, axiosheaders).then((res) => {
      if (typeof res !== "object") return;
      dispatcher(res.data);
    });
  }, dependencies);
}
