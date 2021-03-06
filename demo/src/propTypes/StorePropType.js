import { PropTypes } from 'react-recollect';
import ProductPagePropType from '../pages/products/propTypes/ProductPagePropType';
import { PAGES } from '../shared/constants';
import TodoMvcPropType from '../pages/todomvc/propTypes/TodoMvcPropType';

const StorePropType = PropTypes.shape({
  currentPage: PropTypes.oneOf(Object.values(PAGES)).isRequired,
  loading: PropTypes.bool.isRequired,
  productPage: ProductPagePropType.isRequired,
  todoMvcPage: TodoMvcPropType,
  batchUpdatePage: PropTypes.shape({
    text: PropTypes.string.isRequired,
    grid: PropTypes.shape({}),
  }),
});

export default StorePropType;
