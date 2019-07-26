import React, { createRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  TouchableNativeFeedbackProps,
  TouchableHighlightProps,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  Platform,
  TouchableNativeFeedback,
} from 'react-native';
import Collapsible, { CollapsibleProps } from './Collapsible';

type TouchableProps =
  | TouchableHighlightProps
  | TouchableOpacityProps
  | TouchableNativeFeedbackProps;

export interface AccordionItemProps<T> {
  section: T;
  active: boolean;
}

export interface AccordionProps<T = {}>
  extends Omit<CollapsibleProps, 'collapsed' | 'children' | 'style'> {
  sections: T[];
  expandMultiple?: boolean;
  expandFromBottom?: boolean;
  disabled?: boolean | number[];
  activeSections?: number[];
  containerStyle?: StyleProp<ViewStyle>;
  sectionContainerStyle?: StyleProp<ViewStyle>;
  TouchableComponent?: React.ComponentType<TouchableProps>;
  touchableProps?: TouchableProps;
  scrollOnOpen?: boolean;
  onChange(activeSections: number[]): void;
  keyExtractor?: (section: T, index: number) => string;
  renderContent(info: AccordionItemProps<T>): React.ReactElement;
  renderHeader?(info: AccordionItemProps<T>): React.ReactElement;
  renderSectionTitle?(info: AccordionItemProps<T>): React.ReactElement;
  renderSectionFooter?(info: AccordionItemProps<T>): React.ReactElement;
}

function Accordion<T>({
  sections,
  disabled = false,
  expandMultiple = false,
  expandFromBottom = false,
  scrollOnOpen = false,
  containerStyle,
  sectionContainerStyle,
  activeSections = [],
  keyExtractor,
  renderContent,
  renderHeader = () => null,
  onAnimationEnd = () => null,
  renderSectionTitle = () => null,
  renderSectionFooter = () => null,
  TouchableComponent = Platform.select({
    /// @ts-ignore
    default: TouchableOpacity,
    /// @ts-ignore
    android: TouchableNativeFeedback,
  }),
  onChange,
  touchableProps,
  ...rest
}: AccordionProps<T>) {
  const collapsible = createRef<FlatList<T>>();

  const toggleSection = (index: number) => {
    if (expandMultiple) {
      onChange(
        activeSections.includes(index)
          ? activeSections.filter(a => a !== index)
          : [...activeSections, index]
      );
    } else {
      onChange(activeSections.includes(index) ? [] : [index]);
    }
  };

  const renderCollapsible = ({ section, index }) => (
    <Collapsible
      collapsed={!activeSections.includes(index)}
      onAnimationEnd={() => {
        if (
          activeSections.includes(index) &&
          scrollOnOpen &&
          collapsible.current
        ) {
          collapsible.current.scrollToIndex({
            index,
            viewPosition: expandFromBottom ? 1 : 0,
          });
        }

        onAnimationEnd();
      }}
      {...rest}
    >
      {renderContent({
        section: section,
        active: activeSections.includes(index),
      })}
    </Collapsible>
  );

  return (
    <View style={containerStyle}>
      <FlatList
        ref={collapsible}
        extraData={activeSections}
        data={sections}
        renderItem={({ item, index }) => (
          <View style={sectionContainerStyle}>
            {renderSectionTitle({
              section: item,
              active: activeSections.includes(index),
            })}

            {expandFromBottom && renderCollapsible({ section: item, index })}

            <TouchableComponent
              {...rest}
              disabled={
                typeof disabled === 'boolean'
                  ? disabled
                  : disabled.includes(index)
              }
              onPress={() => toggleSection(index)}
            >
              <View>
                {renderHeader({
                  section: item,
                  active: activeSections.includes(index),
                })}
              </View>
            </TouchableComponent>

            {!expandFromBottom && renderCollapsible({ section: item, index })}

            {renderSectionFooter({
              section: item,
              active: activeSections.includes(index),
            })}
          </View>
        )}
        keyExtractor={keyExtractor}
      />
    </View>
  );
}

export default Accordion;
