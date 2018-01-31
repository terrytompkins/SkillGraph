/* eslint-disable max-len, no-return-assign */

import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const jobs = [];
const jobTypes = [ 'A', 'B', 'C', 'D' ];

function addJobs(quantity) {
  const startId = jobs.length;
  for (let i = 0; i < quantity; i++) {
    const id = startId + i;
    jobs.push({
      id: id,
      status: '200',
      name: 'Item name ' + id,
      type: 'Java',
      active: i % 2 === 0 ? 'Y' : 'N'
    });
  }
}

addJobs(5);

const cellEditProp = {
  mode: 'click',
  blurToSave: true
};

// validator function pass the user input value and should return true|false.
function jobNameValidator(value) {
  const response = { isValid: true, notification: { type: 'success', msg: '', title: '' } };
  if (!value) {
    response.isValid = false;
    response.notification.type = 'error';
    response.notification.msg = 'Value must be inserted';
    response.notification.title = 'Requested Value';
  } else if (value.length < 10) {
    response.isValid = false;
    response.notification.type = 'error';
    response.notification.msg = 'Value must have 10+ characters';
    response.notification.title = 'Invalid Value';
  }
  return response;
}

function jobStatusValidator(value) {
  const nan = isNaN(parseInt(value, 10));
  if (nan) {
    return 'Job Status must be a integer!';
  }
  return true;
}


class UserSkillEditor extends React.Component {
  constructor(props){
     super(props);
     this.state = { selectedOption: '' };
     this.handleChange = this.handleChange.bind(this);
   }


  componentDidMount() {
    const component = this;

    validate(component.form, {
      rules: {
        skillId: {
          required: true,
        },
        skillData: {
          required: true,
        },
      },
      messages: {
        skillId: {
          required: 'A skill must be selected to provide scores.',
        },
        skillData: {
          required: 'At least one data point is required.',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleChange(selectedOption) {
    this.setState({ selectedOption });
    console.log(`Selected: ${selectedOption.label}`);
  }

  getSkillNames() {
      const { skills } = this.props;
      const skillNames = skills.map(function(a) {return a.name;});
      return skillNames;
  }

  // TODO this should return an array of objects with value/label keys for Select
  getSkillOptions() {
      const { skills } = this.props;
      const skillNames = skills.map(function(a) {
        return {value: a._id, label: a.name}
      });
      return skillNames;
  }

  handleSubmit() {
    // TODO: Add test select variable handling here
    const { history } = this.props;
    const existingUserSkill = this.props.doc && this.props.doc._id;
    const methodToCall = existingUserSkill ? 'userSkills.update' : 'userSkills.insert';
    const doc = {
      skillId: this.state.selectedOption.value.trim(),
      skillData: this.skillData,
    };

    if (existingUserSkill) doc._id = existingUserSkill;

    Meteor.call(methodToCall, doc, (error, userSkillId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingUserSkill ? 'UserSkill updated!' : 'UserSkill added!';
        this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push(`/userSkills/${userSkillId}`);
      }
    });
  }

  invalidJobStatus(cell, row) {
    console.log(`${cell} at row id: ${row.id} fails on editing`);
    return 'invalid-jobstatus-class';
  }

  editingJobStatus(cell, row) {
    console.log(`${cell} at row id: ${row.id} in current editing`);
    return 'editing-jobstatus-class';
  }



  render() {
    const { doc } = this.props;
    const { skills } = this.props;

    // const { selectedOption } = doc.skillId;
  	// const value = selectedOption && selectedOption.value;
    // const value = doc && doc.skillId;
    const value = this.state.selectedOption.value;

    return (
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
      {/*
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <input
            type="text"
            className="form-control"
            name="title"
            ref={title => (this.title = title)}
            defaultValue={doc && doc.title}
            placeholder="Oh, The Places You'll Go!"
          />
        </FormGroup>
        */}

        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <Select
                name="form-field-name"
                value={value}
                onChange={this.handleChange}
                options={this.getSkillOptions()}
              />
        </FormGroup>

        <Button type="submit" bsStyle="success">
          {doc && doc._id ? 'Save Changes' : 'Add UserSkill'}
        </Button>
      </form>
    );
  }
}

UserSkillEditor.defaultProps = {
  doc: { skillId: '', skillData: [] },
};

UserSkillEditor.propTypes = {
  doc: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default UserSkillEditor;


{/*
  // replace jobs below with userSkills - an array of userSkill rows
    <BootstrapTable data={ doc } cellEdit={ cellEditProp } insertRow={ true }>
         <TableHeaderColumn dataField='_id' isKey={ true }>User Skill ID</TableHeaderColumn>
         <TableHeaderColumn dataField='status' editable={ { validator: jobStatusValidator } } editColumnClassName={ this.editingJobStatus } invalidEditColumnClassName={ this.invalidJobStatus }>Job Status</TableHeaderColumn>
         <TableHeaderColumn dataField='name' editable={ { type: 'textarea', validator: jobNameValidator } } editColumnClassName='editing-jobsname-class' invalidEditColumnClassName='invalid-jobsname-class'>Job Name</TableHeaderColumn>
         <TableHeaderColumn dataField='type' editable={ { type: 'select', options: { values: this.getSkillNames() } } }>Job Type</TableHeaderColumn>
         <TableHeaderColumn dataField='active' editable={ { type: 'checkbox', options: { values: 'Y:N' } } }>Active</TableHeaderColumn>
</BootstrapTable>

    <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
      <FormGroup>
        <ControlLabel>Title</ControlLabel>
        <input
          type="text"
          className="form-control"
          name="title"
          ref={title => (this.title = title)}
          defaultValue={doc && doc.title}
          placeholder="Oh, The Places You'll Go!"
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Body</ControlLabel>
        <textarea
          className="form-control"
          name="body"
          ref={body => (this.body = body)}
          defaultValue={doc && doc.body}
          placeholder="Congratulations! Today is your day. You're off to Great Places! You're off and away!"
        />
      </FormGroup>
      <Button type="submit" bsStyle="success">
        {doc && doc._id ? 'Save Changes' : 'Add UserSkill'}
      </Button>
    </form>
*/}
