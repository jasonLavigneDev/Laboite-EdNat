import React, { useEffect, useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { useLocation, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { PropTypes } from 'prop-types';
import GroupIcon from '@material-ui/icons/Group';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import HomeIcon from '@material-ui/icons/Home';
import BusinessIcon from '@material-ui/icons/Business';
import AppsIcon from '@material-ui/icons/Apps';
import { useAppContext } from '../../contexts/context';
import updateDocumentTitle from '../../utils/updateDocumentTitle';

const { disabledFeatures = {} } = Meteor.settings.public;

export const links = [
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
];

const useStyles = (mobile) =>
  makeStyles((theme) => ({
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
  const [{ user }] = useAppContext();
  const history = useHistory();
  const classes = useStyles(mobile)();
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
      indicatorColor="secondary"
      textColor="primary"
      aria-label="menu links"
      variant={finalLinks.length < 4 && mobile ? '' : 'scrollable'}
      scrollButtons="on"
      centered={finalLinks.length < 4 && mobile}
    >
      {finalLinks.map((link, index) => (
        <Tab
          {...a11yProps(index)}
          key={link.path}
          value={link.path}
          title={link.tooltip ? i18n.__(`components.MenuBar.${link.tooltip}`) : ''}
          disableFocusRipple={mobile}
          disableRipple={mobile}
          className={mobile ? classes.mobileTabs : classes.elementTab}
          icon={mobile ? link.icon : undefined}
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
