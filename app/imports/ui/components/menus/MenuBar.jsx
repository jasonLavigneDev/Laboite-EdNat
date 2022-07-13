import React, { useEffect, useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { useLocation, useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import { useTracker } from 'meteor/react-meteor-data';
import { Counts } from 'meteor/tmeasday:publish-counts';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { PropTypes } from 'prop-types';
import GroupIcon from '@mui/icons-material/Group';
import Chip from '@mui/material/Chip';
import LibraryBooks from '@mui/icons-material/LibraryBooks';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import AppsIcon from '@mui/icons-material/Apps';
import InfoIcon from '@mui/icons-material/Info';
import { useAppContext } from '../../contexts/context';
import updateDocumentTitle from '../../utils/updateDocumentTitle';

const { disabledFeatures = {} } = Meteor.settings.public;

const useStyles = (mobile) =>
  makeStyles()((theme) => ({
    tabs: {
      color: theme.palette.text.primary,
    },
    mobileTabs: {
      textTransform: 'none',
    },
    elementTab: {
      '&:hover': {
        color: theme.palette.text.primary,
        transition: 'all 300ms ease-in-out',
      },
    },
    flexContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    indicator: {
      top: mobile ? 0 : null,
      height: 3,
      borderTopLeftRadius: mobile ? 0 : theme.shape.borderRadius,
      borderTopRightRadius: mobile ? 0 : theme.shape.borderRadius,
      borderBottomLeftRadius: !mobile ? 0 : theme.shape.borderRadius,
      borderBottomRightRadius: !mobile ? 0 : theme.shape.borderRadius,
    },
  }));

const MenuBar = ({ mobile }) => {
  const { pathname } = useLocation();
  const [{ user, isMobile }] = useAppContext();
  const history = useHistory();
  const { classes } = useStyles(mobile, {
    props: mobile,
  })();

  const notifsCounter = useTracker(() => {
    Meteor.subscribe('notifications.self.counter');
    return Counts.get('notifications.self.counter');
  });
  const links = [
    {
      path: '/introduction',
      content: 'menuIntroduction',
      icon: <InfoIcon />,
      hidden: disabledFeatures.introductionTab,
    },
    {
      path: '/',
      content: 'menuMyspace',
      contentMobile: 'menuMyspaceMobile',
      icon: <HomeIcon />,
      hidden: false,
    },
    {
      path: '/groups',
      content: 'menuGroupes',
      contentMobile: 'menuGroupesMobile',
      icon: <GroupIcon />,
      hidden: disabledFeatures.groups,
    },
    {
      path: '/services',
      content: 'menuServices',
      icon: <AppsIcon />,
      hidden: false,
      tooltip: 'tooltipServices',
    },
    {
      path: '/publications',
      content: 'menuArticles',
      contentMobile: 'menuArticlesMobile',
      icon: <LibraryBooks />,
      hidden: disabledFeatures.blog,
    },
    {
      path: '/structure',
      content: 'menuStructure',
      icon: <BusinessIcon />,
      hidden: false,
      tooltip: 'tooltipStructure',
    },
    {
      path: '/notifications',
      content: 'menuNotifications',
      icon: <NotificationsNoneIcon />,
      hidden: !isMobile || !disabledFeatures.notificationsTab,
      chip: notifsCounter,
    },
  ];
  const T = i18n.createComponent('components.MenuBar');
  const [currentLink, setCurrentLink] = useState('/');

  useEffect(() => {
    links.forEach((link) => {
      if (link.path === pathname || (pathname.search(link.path) > -1 && link.path !== '/')) {
        setCurrentLink(link.path);
      }
    });
  }, [pathname]);

  const finalLinks = links.filter(({ path, hidden }) => {
    if (hidden || (path === '/publications' && !user.articlesEnable)) {
      return false;
    }
    return true;
  });

  function a11yProps(index) {
    return {
      id: `scrollable-force-tab-${index}`,
      'aria-controls': `scrollable-force-tabpanel-${index}`,
    };
  }
  const handleClick = (link) => {
    updateDocumentTitle(i18n.__(`components.MenuBar.${link.content}`));
    history.push(link.path);
  };

  const initIndicator = (actions) => {
    if (actions) {
      setTimeout(actions.updateIndicator.bind(actions), 500);
    }
  };

  return (
    <Tabs
      className={classes.tabs}
      classes={{
        flexContainer: classes.flexContainer,
        indicator: classes.indicator,
      }}
      action={initIndicator}
      value={currentLink}
      to={currentLink}
      indicatorColor="secondary"
      textColor="primary"
      aria-label="menu links"
      variant={finalLinks.length < 4 && mobile ? '' : 'scrollable'}
      scrollButtons
      centered={finalLinks.length < 4 && mobile}
      allowScrollButtonsMobile
    >
      {finalLinks.map((link, index) => (
        <Tab
          {...a11yProps(index)}
          key={link.path}
          value={link.path}
          to={link.path}
          title={link.tooltip ? i18n.__(`components.MenuBar.${link.tooltip}`) : ''}
          disableFocusRipple={mobile}
          disableRipple={mobile}
          className={mobile ? classes.mobileTabs : classes.elementTab}
          icon={mobile ? link.chip ? <Chip size="small" label={link.chip} color="secondary" /> : link.icon : undefined}
          label={<T>{link.contentMobile || link.content}</T>}
          onClick={() => handleClick(link)}
        />
      ))}
    </Tabs>
  );
};

export default MenuBar;

MenuBar.propTypes = {
  mobile: PropTypes.bool,
};

MenuBar.defaultProps = {
  mobile: false,
};
