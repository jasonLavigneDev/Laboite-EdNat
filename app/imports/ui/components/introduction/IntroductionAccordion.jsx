import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import { useZoneStyles as useStyles } from '../personalspace/PersonalZone';
import { useAppContext } from '../../contexts/context';

const IntroductionAccordion = ({ summary, head = '', body, startExpanded = false }) => {
  const [{ isMobile }] = useAppContext();
  const [isExpanded, setIsExpanded] = useState(startExpanded || false);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const classes = useStyles(isMobile);

  return (
    <Accordion className={`${classes.expansionpanel} ${classes.cursorPointer}`} expanded={isExpanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon className={classes.cursorPointer} />}
        className={classes.cursorPointer}
        onClick={toggleExpand}
      >
        <Typography variant="h5" color="primary" className={classes.zone}>
          {summary}
        </Typography>
      </AccordionSummary>
      <AccordionDetails style={{ display: 'block' }}>
        <Grid display="flex">
          {head && (
            <>
              <Typography variant={isMobile ? 'h6' : 'h4'}>{head}</Typography> <Divider />
            </>
          )}

          <div style={{ padding: '10px' }} dangerouslySetInnerHTML={{ __html: body || '' }} />
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

IntroductionAccordion.propTypes = {
  summary: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  head: PropTypes.string,
  startExpanded: PropTypes.bool,
};

IntroductionAccordion.defaultProps = {
  startExpanded: false,
  head: '',
};

export default IntroductionAccordion;
