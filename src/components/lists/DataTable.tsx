import React from 'react';
import { List } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import Section from 'src/components/utils/Section';
import NoData from 'src/components/utils/EmptyList';

export type DataTableOptProps = {
  title?: React.ReactNode,
  level?: number,
  noDataDesc?: React.ReactNode,
  noDataExt?: React.ReactNode,
  className?: string,
}

export type DataTableProps<T extends any> = DataTableOptProps & {
  totalCount?: number,
  dataSource: T[],
  renderItem: (item: T, index: number) => JSX.Element,
  paginationConfig?: PaginationConfig,
  children?: React.ReactNode
}

export function DataTable<T extends any> (props: DataTableProps<T>) {
  const {
    dataSource,
    totalCount,
    renderItem,
    className,
    title,
    level,
    noDataDesc = null,
    noDataExt,
    paginationConfig,
    children
  } = props;

  const total = totalCount || dataSource.length


  const hasData = total > 0;

  const list = hasData
    ? <List
      className={'orderTable ' + className}
      itemLayout='vertical'
      size='large'
      pagination={paginationConfig}
      dataSource={dataSource}
      renderItem={(item, index) =>
        <List.Item key={`${new Date().getTime()}-${index}`}>
          {renderItem(item, index)}
        </List.Item>
      }
    >
      {children}
    </List>
    : <NoData description={noDataDesc}>{noDataExt}</NoData>

  const renderTitle = () =>
    <div className='DfTitle--List'>{title}</div>

  return !title
    ? list
    : <Section title={renderTitle()} level={level}>{list}</Section>
}

export default DataTable
