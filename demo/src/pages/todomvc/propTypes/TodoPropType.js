import { PropTypes } from 'react-recollect';

const TodoPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired,
});

export default TodoPropType;
