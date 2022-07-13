import React from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AppBar from '@mui/material/AppBar';
import { PropTypes } from 'prop-types';
import HomeIcon from '@mui/icons-material/Home';
import AppsIcon from '@mui/icons-material/Apps';
import HelpIcon from '@mui/icons-material/Help';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useAppContext } from '../../contexts/context';

export const links = [
  {
    content: 'home',
    icon: <HomeIcon />,
  },
  {
    content: 'apps',
    icon: <AppsIcon />,
  },
  {
    content: 'help',
    icon: <HelpIcon />,
  },
];

const useStyles = makeStyles()((theme, isMobile) => ({
  root: {
    backgroundColor: theme.palette.tertiary.main,
    bottom: 0,
    top: 'auto',
  },
  tabs: {
    color: theme.palette.text.primary,
  },
  mobileTabs: {
    textTransform: 'none',
  },
  elementTab: {
    textTransform: 'capitalize',
    paddingLeft: isMobile ? null : 50,
    paddingRight: isMobile ? null : 50,
    '&:hover': {
      color: theme.palette.text.primary,
      transition: 'all 300ms ease-in-out',
    },
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    top: 0,
    height: 3,
    color: theme.palette.secondary.primary,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
}));

const OfflineMenu = ({ state: [selectedTab, setTab] }) => {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);
  const { trackEvent } = useMatomo();

  function a11yProps(index) {
    return {
      id: `scrollable-force-tab-${index}`,
      'aria-controls': `scrollable-force-tabpanel-${index}`,
    };
  }

  const handleChangeMenu = (menuItem) => {
    trackEvent({
      category: 'signin-page',
      action: 'click-menu',
      name: `Sélectionne la page ${menuItem}`,
    });
    setTab(menuItem);
  };

  return (
    <AppBar position="fixed" className={classes.root}>
      <Tabs
        className={classes.tabs}
        classes={{
          flexContainer: classes.flexContainer,
          indicator: classes.indicator,
        }}
        value={selectedTab}
        indicatorColor="secondary"
        textColor="primary"
        aria-label="menu links"
        variant={isMobile ? 'fullWidth' : 'standard'}
        scrollButtons
        allowScrollButtonsMobile
      >
        {links.map((link, index) => (
          <Tab
            {...a11yProps(index)}
            key={link.content}
            value={link.content}
            disableFocusRipple
            disableRipple
            className={classes.elementTab}
            icon={link.icon}
            label={i18n.__(`components.OfflineMenu.${link.content}`)}
            onClick={() => handleChangeMenu(link.content)}
          />
        ))}
      </Tabs>
    </AppBar>
  );
};

export default OfflineMenu;

OfflineMenu.propTypes = {
  state: PropTypes.arrayOf(PropTypes.string, PropTypes.func).isRequired,
};
