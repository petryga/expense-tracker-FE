import { createContext, useContext } from "react";
import styles from "./AssetsPage.module.css";

export const Context = createContext<{
  totalSelectedCad: number | null;
  totalSelectedUsd?: number | null;
} | null>(null);

export const CustomFooter = () => {
  const { totalSelectedCad, totalSelectedUsd } = useContext(Context) || {};

  const visible = totalSelectedCad || totalSelectedUsd;

  return (
    <div
      className={`${styles.footer} ${visible ? styles.footerVisible : styles.footerHidden}`}
    >
      {visible && (
        <div>
          Total Amount of Selected Entries - ${totalSelectedCad?.toFixed(2)}$
          (CAD) / ${totalSelectedUsd?.toFixed(2)}$ (USD)
        </div>
      )}
    </div>
  );
};
