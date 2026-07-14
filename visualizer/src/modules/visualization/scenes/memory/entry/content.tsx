import { Tooltip } from '@radix-ui/themes';
import React, { Fragment, useMemo } from 'react';
import { ArcherElement } from 'react-archer';
import styled from 'styled-components';
import {
  PositionEntry,
  RegionEntryState,
  parsedVizspec,
  useSettings
} from '../../../../state';
import { EntryHeaderPart } from './headerPart';

let ContentOuter = styled.div`
  width: 100%;
  padding: 0px 10px;
  display: flex;
  align-items: center;
`;

let ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0px;
`;

let ContentP = styled.p`
  text-overflow: ellipsis;
  white-space: nowrap;
  /* display: inline-flex;
  align-items: center; */

  b {
    font-weight: 800;
  }

  i {
    font-style: italic;
  }

  mark {
    /* color: #1e90ff; */
    /* font-weight: 600; */
    font-style: italic;
  }
`;

export let EntryContentHeader = styled(ContentP)`
  font-size: 12px;
  font-weight: 800;
  color: #333;
`;

export let Content = styled(ContentP)`
  font-size: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

let ContentValue = styled(ContentP)`
  overflow: hidden;
  font-size: 14px;
`;

export let EntryContent = ({
  entry,
  region
}: {
  entry: PositionEntry;
  region: RegionEntryState;
}) => {
  let mcRegion = useMemo(() => parsedVizspec.declarations.region[region.name], [region.name]);
  let { entrySize, entryName } = useSettings();

  return useMemo(() => {
    let inner: React.ReactNode = null;

    let arrayName: string | undefined = undefined;
    if (entry.fieldKind == 'field_entry' && entry.fieldGroup.groupEntry.typeId == 'array') {
      let index = entry.address.main - entry.fieldGroup.groupEntry.address.main - 1;
      if (index >= 0) arrayName = `[${index}]`;
    }

    let name = arrayName ?? entry.name;
    let type = entry.symbolType?.name;

    if (entry.alternativeNames[entryName]) name = entry.alternativeNames[entryName];

    let isPointer = entry.type.kind == 'pointer';

    if (entrySize == 'large') {
      let value = (
        <ContentValue>
          {!name && !type && <span>Value: </span>}

          {type && <span>{type} </span>}

          {name && (
            <>
              {name.length > 30 ? (
                <Tooltip content={name}>
                  <mark>{name}</mark>
                </Tooltip>
              ) : (
                <mark>{name}</mark>
              )}
            </>
          )}

          <span>
            {' '}
            {(name || type) && '='} {entry.value}
          </span>

          {isPointer && <span> ({entry.value == 0 ? 'null' : 'ref'})</span>}
        </ContentValue>
      );

      let headerExtra = (
        <>
          [
          {[
            <EntryHeaderPart
              name="Address"
              nameShort="addr"
              value={isPopup => (
                <>
                  {entry.address.main}
                  {entry.address.multiSlice && `[${entry.address.slice}]`}
                </>
              )}
            />,
            // entry.symbolType && (
            //   <EntryHeaderPart
            //     name="Type"
            //     value={isPopup => (
            //       <>
            //         {/* {isPopup && isPointer && 'ref '} */}
            //         {entry.symbolType?.name}
            //       </>
            //     )}
            //   />
            // ),
            isPointer && (
              <EntryHeaderPart
                name="Pointer"
                value={isPopup => (
                  <>
                    {/* {isPopup && `addr ${entry.value} in `} */}
                    {entry.type.region}
                  </>
                )}
                eq=" → "
              />
            )
          ]
            .filter(Boolean)
            .reduce((acc, el, i) => {
              if (i > 0) acc.push(' • ');
              acc.push(el);

              return acc;
            }, [] as React.ReactNode[])
            .map((el, i) => (
              <Fragment key={i}>{el}</Fragment>
            ))}
          ]
        </>
      );

      let header = (
        <EntryContentHeader>
          {entry.type.name} {headerExtra}
        </EntryContentHeader>
      );

      if (entry.function && entry.variable) {
        header = <EntryContentHeader>Local {headerExtra}</EntryContentHeader>;
      }

      if (entry.isGlobal && entry.variable) {
        header = <EntryContentHeader>Global {headerExtra}</EntryContentHeader>;
      }

      inner = (
        <>
          {header}
          {value}
        </>
      );
    } else {
      let address = (
        <span
          style={{
            background: 'black',
            padding: '2px 3px',
            color: 'white',
            borderRadius: '5px',
            fontWeight: 600,
            lineHeight: 1,
            minWidth: 20,
            textAlign: 'center'
          }}
        >
          <EntryHeaderPart
            reverse
            name="Address"
            value={isPopup => (
              <>
                {entry.address.main}
                {entry.address.multiSlice && `[${entry.address.slice}]`}
              </>
            )}
          />
        </span>
      );

      let contentParts: React.ReactNode[] = [];

      if (entry.type.display == 'special') {
        contentParts = [
          address,

          type && (
            <EntryHeaderPart
              name="Type"
              reverse
              value={isPopup => (
                <>
                  {/* {isPopup && isPointer && 'ref '} */}
                  {type}
                </>
              )}
            />
          ),

          <span
            style={{
              fontWeight: 600
            }}
          >
            {entry.type.name}
          </span>,

          name && (
            <EntryHeaderPart
              name="Name"
              reverse
              value={isPopup => <>{isPopup ? name : <mark>{name}</mark>}</>}
            />
          ),

          <span>=</span>,

          <EntryHeaderPart reverse name="Value" value={isPopup => <>{entry.value}</>} />
        ];
      } else if (entry.type.display == 'value') {
        contentParts = [
          address,

          type && (
            <EntryHeaderPart
              reverse
              name="Type"
              value={isPopup => (
                <>
                  {type}
                  {/* {isPopup && isPointer && ' ref'} */}
                </>
              )}
            />
          ),

          name && <mark>{name}</mark>,
          name && name != 'null' && <span>=</span>,
          name != 'null' && (
            <EntryHeaderPart reverse name="Value" value={isPopup => <>{entry.value}</>} />
          )
        ];
      }

      inner = (
        <Content>
          {contentParts.map((el, i) => (
            <Fragment key={i}>{el}</Fragment>
          ))}
        </Content>
      );
    }

    return (
      <ArcherElement
        id={`entry-${entry.region.name}-${entry.address.main}-${entry.address.slice}`}
      >
        <ContentOuter
          style={{ width: entry.position.width, height: entry.position.height }}
          data-anchor-id={`entry-${entry.region.name}-${entry.address.main}-${entry.address.slice}`}
        >
          <ContentWrapper>{inner}</ContentWrapper>
        </ContentOuter>
      </ArcherElement>
    );
  }, [mcRegion, entry, entryName]);
};
