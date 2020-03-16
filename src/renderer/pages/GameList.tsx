import classNames from "classnames";
import { GameRecord } from "common/butlerd/messages";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameListDetail } from "renderer/pages/GameListDetail";
import { fontSizes, mixins } from "renderer/theme";
import { useDownloads } from "renderer/use-downloads";
import { useGame } from "renderer/use-game";
import { useLaunches } from "renderer/use-launches";
import styled from "styled-components";

interface Props {
  records: GameRecord[];
  setRecords: React.Dispatch<React.SetStateAction<GameRecord[]>>;
}

const coverWidth = 300;
const coverHeight = 215;
const ratio = 0.6;

const wide1 = 1400;

const GameListDiv = styled.div`
  height: 100%;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;

  .list {
    background: rgba(255, 255, 255, 0.05);
    flex-basis: 300px;
    flex-shrink: 0;
    overflow-y: scroll;

    padding: 12px 0;

    &:focus {
      outline: none;
    }
  }

  .detail {
    flex-grow: 1;
    overflow-y: auto;

    display: flex;
    flex-direction: column;
    align-items: stretch;

    padding: 25px;

    @media (min-width: ${wide1}px) {
      padding: 40px;
    }

    position: relative;

    h3 {
      font-size: ${fontSizes.enormous};
      font-weight: 800;

      @media (min-width: ${wide1}px) {
        font-size: ${fontSizes.excessive};
        font-weight: bold;
      }
    }

    .detail-background {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background-size: cover;
      background-position: 50% 50%;
      z-index: 0;
    }

    .detail-content {
      z-index: 1;
    }

    .header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .cover-section {
        flex-shrink: 0;

        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .cover-section .controls {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .cover-section {
        .placeholder,
        img {
          width: ${coverWidth * ratio}px;
          height: ${coverHeight * ratio}px;

          @media (min-width: ${wide1}px) {
            width: ${coverWidth}px;
            height: ${coverHeight}px;
          }

          margin-left: 10px;
          margin-bottom: 20px;

          border-radius: 2px;
          border: 1px solid rgba(0, 0, 0, 0.2);
          box-shadow: 0 0 20px 0 #121212;
        }

        .placeholder {
          background: #272727;
        }
      }

      .info p {
        padding-top: 1em;
        line-height: 1.4;

        &.short-text {
          max-width: 500px;
        }

        &.secondary {
          color: ${p => p.theme.colors.text2};
        }
      }

      .download {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: ${p => p.theme.colors.text2};

        .progress-bar {
          margin-left: 10px;
        }
      }
    }

    .screenshots {
      margin-top: 20px;
      padding: 20px;
      display: flex;
      flex-direction: row;
      align-items: center;

      overflow-x: hidden;
      box-shadow: inset 0 0 20px black;

      img {
        border-radius: 2px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        box-shadow: 0 0 20px 0 #121212;

        max-height: 180px;
        @media (min-width: ${wide1}px) {
          max-height: 220px;
        }
        margin-right: 20px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  .row {
    ${mixins.singleLine};
    display: flex;
    align-items: center;
    text-align: left;
    padding: 8px 10px;
    padding-left: 20px;

    &.current {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .list:focus .row.current {
    background: #7b3232;
  }

  .status {
    flex-basis: 100px;
  }

  .installed {
    flex-basis: 100px;
  }

  .title {
    flex-grow: 1;
    color: inherit;
  }

  a {
    text-decoration: none;
  }
`;

const findGameId = (el: HTMLElement): number | undefined => {
  if (typeof el.dataset.gameId !== "undefined") {
    return Number(el.dataset.gameId);
  }

  if (el.parentElement) {
    return findGameId(el.parentElement);
  }
  return undefined;
};

const findIndex = (el: HTMLElement): number | undefined => {
  if (typeof el.dataset.index !== undefined) {
    return Number(el.dataset.index);
  }

  if (el.parentElement) {
    return findIndex(el.parentElement);
  }
  return undefined;
};

export const GameList = (props: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentRecord: GameRecord | null = props.records[currentIndex];
  const launches = useLaunches();
  const downloads = useDownloads();

  const listRef = useRef<HTMLDivElement | null>(null);

  let recordsLength = props.records.length;
  useEffect(() => {
    if (currentIndex >= recordsLength) {
      setCurrentIndex(0);
    }
  }, [currentIndex, recordsLength]);

  const game = useGame(currentRecord?.id);

  const rowClick = useCallback((ev: React.MouseEvent<HTMLElement>) => {
    const index = findIndex(ev.currentTarget);
    if (typeof index === "undefined") {
      return;
    }
    setCurrentIndex(index);
  }, []);

  let listRefCurrent = listRef.current;
  const focusIndex = useCallback(
    (index: number) => {
      listRefCurrent
        ?.querySelector(`.row[data-index='${index}']`)
        ?.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "nearest",
        });
    },
    [listRefCurrent]
  );

  const listKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLElement>) => {
      console.log(`list key down, key = `, ev.key);

      switch (ev.key) {
        case "ArrowDown":
          ev.preventDefault();
          setCurrentIndex(i => {
            let index = (i + 1) % recordsLength;
            focusIndex(index);
            return index;
          });
          break;
        case "ArrowUp":
          ev.preventDefault();
          setCurrentIndex(i => {
            let index = i == 0 ? recordsLength - 1 : i - 1;
            focusIndex(index);
            return index;
          });
          break;
      }
    },
    [focusIndex, recordsLength]
  );

  return (
    <GameListDiv>
      <div className="list" ref={listRef} tabIndex={0} onKeyDown={listKeyDown}>
        {props.records.map((r, index) => {
          return (
            <div
              className={classNames("row", { current: index == currentIndex })}
              key={r.id}
              data-index={index}
              data-game-id={r.id}
              onClick={rowClick}
            >
              <a className="title">{r.title}</a>
            </div>
          );
        })}
      </div>

      <div className="detail">
        <GameListDetail game={game} launches={launches} downloads={downloads} />
      </div>
    </GameListDiv>
  );
};
