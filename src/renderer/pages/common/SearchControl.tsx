import { Dispatch } from "common/types";
import { ambientTab } from "common/util/navigation";
import React from "react";
import { InjectedIntl } from "react-intl";
import { hookWithProps } from "renderer/hocs/hook";
import { dispatchTabEvolve, urlWithParams } from "renderer/hocs/tab-utils";
import { withIntl } from "renderer/hocs/withIntl";
import { withTab } from "renderer/hocs/withTab";
import FilterInput from "renderer/pages/common/FilterInput";
import { TString } from "renderer/t";
import { debounce } from "underscore";

class SearchControl extends React.PureComponent<Props> {
  render(): JSX.Element {
    const { defaultValue } = this.props;
    return (
      <FilterInput
        defaultValue={defaultValue}
        placeholder={TString(this.props.intl, ["grid.criterion.filter"])}
        onChange={e => this.setSearch(e.currentTarget.value)}
      />
    );
  }

  setSearch = debounce((search: string) => {
    const { url } = this.props;
    dispatchTabEvolve(this.props, {
      replace: true,
      url: urlWithParams(url, { search }),
    });
  }, 250);
}

interface Props {
  tab: string;
  dispatch: Dispatch;
  intl: InjectedIntl;

  url: string;
  defaultValue: string;
}

export default withTab(
  withIntl(
    hookWithProps(SearchControl)(map => ({
      url: map((rs, props) => ambientTab(rs, props).location.url),
      defaultValue: map(
        (rs, props) => ambientTab(rs, props).location.query.search
      ),
    }))(SearchControl)
  )
);
