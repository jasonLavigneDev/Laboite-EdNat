import React, { useEffect, useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { useLocation, useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { PropTypes } from 'prop-types';
import GroupIcon from '@mui/icons-material/Group';
import Chip from '@mui/material/Chip';
import LibraryBooks from '@mui/icons-material/LibraryBooks';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import AppsIcon from '@mui/icons-material/Apps';
import InfoIcon from '@mui/icons-material/Info';
import Divider from '@mui/material/Divider';
import { useAppContext } from '../../contexts/context';
import updateDocumentTitle from '../../utils/updateDocumentTitle';

const { disabledFeatures = {} } = Meteor.settings.public;

const useStyles = makeStyles()((theme, mobile) => ({
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
  divider: {
    minWidth: 0,
    padding: '0px 0px',
  },
  dividerIcon: {
    marginTop: mobile ? '0px' : '8px',
    marginBottom: mobile ? '0px' : '8px',
  },
}));

const MenuBar = ({ mobile }) => {
  const { pathname } = useLocation();
  const [{ user }] = useAppContext();
  const history = useHistory();
  const { classes } = useStyles(mobile);

  const links = [
    {
      path: '/',
      content: 'menuIntroduction',
      icon: <InfoIcon />,
      hidden: disabledFeatures.introductionTab || mobile,
    },
    {
      path: '/divider1',
      separator: true,
      hidden: disabledFeatures.introductionTab || mobile,
    },
    {
      path: '/personal',
      content: 'menuMyspace',
      contentMobile: 'menuMyspaceMobile',
      icon: <HomeIcon />,
      hidden: false,
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
      contentMobile: 'menuStructureMobile',
      icon: <BusinessIcon />,
      hidden: false,
      tooltip: 'tooltipStructure',
    },
    {
      path: '/divider2',
      separator: true,
      hidden: false,
    },
    {
      path: '/services',
      content: 'menuServices',
      contentMobile: 'menuServicesMobile',
      icon: <AppsIcon />,
      hidden: false,
      tooltip: 'tooltipServices',
    },
    {
      path: '/groups',
      content: 'menuGroupes',
      contentMobile: 'menuGroupesMobile',
      icon: <GroupIcon />,
      hidden: disabledFeatures.groups,
    },
  ];
  const T = i18n.createComponent('components.MenuBar');
  const [currentLink, setCurrentLink] = useState(false);

  const finalLinks = links.filter(({ path, hidden }) => {
    if (hidden || (path === '/publications' && !user.articlesEnable)) {
      return false;
    }
    return true;
  });

  const updateTabValue = (init) => {
    if (currentLink || init) {
      const newLocation = finalLinks.find(
        ({ path }) => path === pathname || (pathname.search(path) > -1 && path !== '/'),
      );
      setCurrentLink(!!newLocation && newLocation.path);
    }
  };

  useEffect(() => {
    updateTabValue();
  }, [pathname]);

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
      setTimeout(() => updateTabValue(true), 500);
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
      scrollButtons
      centered={finalLinks.length < 4 && mobile}
      allowScrollButtonsMobile
    >
      {finalLinks.map((link, index) =>
        link.separator === true ? (
          <Tab
            className={classes.divider}
            key={link.path}
            value={link.path}
            label=""
            icon={<Divider className={classes.dividerIcon} orientation="vertical" variant="middle" flexItem />}
            disabled
          />
        ) : (
          <Tab
            {...a11yProps(index)}
            key={link.path}
            value={link.path}
            to={link.path}
            title={link.tooltip ? i18n.__(`components.MenuBar.${link.tooltip}`) : ''}
            disableFocusRipple={mobile}
            disableRipple={mobile}
            className={mobile ? classes.mobileTabs : classes.elementTab}
            icon={
              mobile ? link.chip ? <Chip size="small" label={link.chip} color="secondary" /> : link.icon : undefined
            }
            label={<T>{mobile && link.contentMobile ? link.contentMobile : link.content}</T>}
            onClick={() => handleClick(link)}
          />
        ),
      )}
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
