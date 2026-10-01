import { HeaderBar as D2HeaderBar } from "@dhis2/ui";
import styles from "./HeaderBar.module.css";

type HeaderBarProps = {
    appName: string;
};

// avoid rendering header for versions > 2.41
// https://developers.dhis2.org/docs/references/global-shell/#header-bars
export const HeaderBar: React.FC<HeaderBarProps> = props => {
    const { appName } = props;
    const shouldRenderHeaderBar = window.self === window.top;
    if (!shouldRenderHeaderBar) return null;

    return (
        <div className={styles.headerBarWrapper}>
            <D2HeaderBar appName={appName} />
        </div>
    );
};
