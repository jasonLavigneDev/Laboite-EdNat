import React, { useState } from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from 'sanitize-html';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';

import ServiceDetails from './ServiceDetails';
import { useZoneStyles as useStyles } from '../personalspace/PersonalZone';

const ServiceDetailsListZone = ({ services, index, title, favAction, isShort, isExpandedZone }) => {
  const { classes } = useStyles();
  const [isExpanded, setIsExpanded] = useState(isExpandedZone);
  const handleClickExpansion = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <Accordion className={classes.expansionpanel} expanded={isExpanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon className={classes.cursorPointer} />}
        aria-controls={`zone-${title}-${index}`}
        id={`expand-${index}`}
        onClick={handleClickExpansion}
        classes={{ expanded: classes.expansionpanelsummaryexpanded, content: classes.expansionpanelsummarycontent }}
      >
        <Typography variant="h5" color="primary" className={classes.zone}>
          <div>
            <Badge
              classes={{ badge: classes.badge }}
              color="secondary"
              badgeContent={services.length}
              invisible={isExpanded}
              showZero
            >
              <span
                id={`title-${index}`}
                role="presentation"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}
              />
            </Badge>
          </div>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          {services.length === 0
            ? null
            : services
                .map((serv) => {
                  return (
                    <Grid className={classes.gridItem} item key={`service_${serv._id}`} xs={12} sm={6} md={4} lg={3}>
                      <ServiceDetails service={serv} favAction={favAction(serv._id)} isShort={isShort} />
                    </Grid>
                  );
                })
                .filter((item) => item !== null)}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

ServiceDetailsListZone.propTypes = {
  services: PropTypes.arrayOf(PropTypes.object).isRequired,
  index: PropTypes.number,
  title: PropTypes.string.isRequired,
  favAction: PropTypes.func.isRequired,
  isShort: PropTypes.bool,
  isExpandedZone: PropTypes.bool,
};

ServiceDetailsListZone.defaultProps = {
  isShort: false,
  isExpandedZone: false,
  index: null,
};

export default ServiceDetailsListZone;
