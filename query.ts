export type QueryState = {
  filterExpressions: any[];
  selectExpressions: any[];
  groupExpressions: any[];
  orderExpressions: any[];
  calculation: boolean;
  rawMode: boolean;
  withDead: boolean;
  limit: number;
  offset: number;
  table: any;
  tableOptions?: any;
};

export class Query {
  private state: QueryState;

  constructor(state: Partial<QueryState> & Pick<QueryState, 'table'>) {
    this.state = {
      filterExpressions: state.filterExpressions || [],
      selectExpressions: state.selectExpressions || [],
      groupExpressions: state.groupExpressions || [],
      orderExpressions: state.orderExpressions || [],
      calculation: false,
      rawMode: false,
      withDead: false,
      limit: null,
      offset: null,
      ...state,
    };
  }

  filter(expr: QueryState['filterExpressions'][number]) {
    return new Query({
      ...this.state,
      filterExpressions: [...this.state.filterExpressions, expr],
    });
  }

  unfilter(exprs: QueryState['filterExpressions']) {
    let exprSet = new Set(exprs);
    return new Query({
      ...this.state,
      filterExpressions: this.state.filterExpressions.filter(
        (expr) => !exprSet.has(Object.keys(expr)[0])
      ),
    });
  }

  select(exprs: any = []) {
    if (!Array.isArray(exprs)) {
      exprs = [exprs];
    }

    let query = new Query({ ...this.state, selectExpressions: exprs });
    query.state.calculation = false;
    return query;
  }

  calculate(expr: any) {
    let query = this.select({ result: expr });
    query.state.calculation = true;
    return query;
  }

  groupBy(exprs: any | any[]) {
    if (!Array.isArray(exprs)) {
      exprs = [exprs];
    }

    return new Query({
      ...this.state,
      groupExpressions: [...this.state.groupExpressions, ...exprs],
    });
  }

  orderBy(exprs: any | any[]) {
    if (!Array.isArray(exprs)) {
      exprs = [exprs];
    }

    return new Query({
      ...this.state,
      orderExpressions: [...this.state.orderExpressions, ...exprs],
    });
  }

  limit(num: number) {
    return new Query({ ...this.state, limit: num });
  }

  offset(num: number) {
    return new Query({ ...this.state, offset: num });
  }

  raw() {
    return new Query({ ...this.state, rawMode: true });
  }

  withDead() {
    return new Query({ ...this.state, withDead: true });
  }

  options(opts: QueryState['tableOptions']) {
    return new Query({ ...this.state, tableOptions: opts });
  }

  serialize() {
    return this.state;
  }
}

export default function q(table: QueryState['table']) {
  return new Query({ table });
}
