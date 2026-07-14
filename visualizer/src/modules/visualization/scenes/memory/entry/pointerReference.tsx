import { motion } from 'framer-motion';
import { useId, useRef, useState } from 'react';
import { ArcherElement } from 'react-archer';
import { PositionEntry } from '../../../../state';

export let EntryPointerReference = ({
  children,
  entry
}: {
  children: React.ReactNode;
  entry: PositionEntry;
}) => {
  let [hover, setHover] = useState(false);
  let toRef = useRef<number | null>(null);
  let id = useId();

  let targetId = `entry-${entry.type.region}-${entry.value}-0`;

  return (
    <ArcherElement
      id={`entry-${id}`}
      relations={
        hover
          ? [
              {
                targetId,
                sourceAnchor: entry.value < entry.address.main ? 'top' : 'bottom',
                targetAnchor: entry.value > entry.address.main ? 'top' : 'bottom'
              }
            ]
          : []
      }
    >
      <motion.div
        data-anchored-to-id={targetId}
        data-active={hover}
        onHoverStart={() => {
          toRef.current = window.setTimeout(() => {
            setHover(true);
          }, 100);
        }}
        onHoverEnd={() => {
          if (toRef.current) {
            clearTimeout(toRef.current);
            toRef.current = null;
          }

          setHover(false);
        }}
        // style={{ height: entry.position.top + entry.position.height - REGION_HEADER_HEIGHT }}
      >
        {children}
      </motion.div>
    </ArcherElement>
  );
};
