import React from "react";
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import SpeedDial from '@material-ui/lab/SpeedDial';
import { makeStyles } from '@material-ui/core/styles';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';

const useStyles = makeStyles((theme) => ({
    root: {
      height: 380,
      transform: 'translateZ(0px)',
      flexGrow: 1,
    },
    speedDial: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  }));

  export interface SpeedDialActionOption {
    icon: React.ReactNode;
    name: string;
    //@ts-ignore
    onClick: (event: MouseEvent<HTMLDivElement>) => void;
  }

export const SpeedDialActionTable: React.FC<SpeedDialActionTableProps> = ({ actions }) => {
    const [open, setOpen] = React.useState(false);
    const classes = useStyles();
  
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
    return (
        <SpeedDial
                ariaLabel="SpeedDial tooltip"
                className={classes.speedDial}
                icon={<SpeedDialIcon />}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
            >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={action.onClick}
          />
        ))}
        </SpeedDial>
    );
};

export interface SpeedDialActionTableProps {
    actions: SpeedDialActionOption[];
}
