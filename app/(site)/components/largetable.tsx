//source: https://codesandbox.io/s/react-window-with-table-elements-d861o?file=/src/index.tsx


import React from 'react'
import { useState, useRef, useContext } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'

/** Context for cross component communication */
const VirtualTableContext = React.createContext<{
  tableClass?: string
  top: number
  setTop: (top: number) => void
  header: React.ReactNode
  footer: React.ReactNode
}>({
  top: 0,
  setTop: (value: number) => { },
  header: <></>,
  footer: <></>,
});

/**
 * The Inner component of the virtual list. This is the "Magic".
 * Capture what would have been the top elements position and apply it to the table.
 * Other than that, render an optional header and footer.
 **/
const Inner = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  function Inner({ children, ...rest }, ref) {
    const { header, footer, top, tableClass } = useContext(VirtualTableContext)
    return (
      <>
        <div {...rest} ref={ref}>
          <table className={tableClass} style={{ top, position: 'absolute', width: '100%' }}>
            <tbody>{children}</tbody>
            {footer}
          </table>
        </div>
      </>
    )
  }
)

type VirtualTableProps = {
  tableClass?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  row: FixedSizeListProps['children']
} & Omit<FixedSizeListProps, 'children' | 'innerElementType'>;

/** The virtual table. It basically accepts all of the same params as the original FixedSizeList.*/
export default function LargeTable({
  row,
  header,
  footer,
  tableClass,
  ...rest
}: VirtualTableProps) {
  const listRef = useRef<FixedSizeList | null>()
  const [top, setTop] = useState(0)
  const headerMarkup = (
    <div style={{ paddingRight: "18px" }}>
      <table className={tableClass}>
        <thead>
          {header}
        </thead>
      </table>
    </div>
  );

  return (
    <VirtualTableContext.Provider value={{ top, setTop, header, footer, tableClass }}>
      {header && headerMarkup}
      <FixedSizeList
        {...rest}
        innerElementType={Inner}
        onItemsRendered={props => {
          const style =
            listRef.current &&
            // @ts-ignore private method access
            listRef.current._getItemStyle(props.overscanStartIndex)
          setTop((style && style.top) || 0)

          // Call the original callback
          rest.onItemsRendered && rest.onItemsRendered(props)
        }}
        ref={el => (listRef.current = el)}
      >
        {row}
      </FixedSizeList>
    </VirtualTableContext.Provider>
  )
};
