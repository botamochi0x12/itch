import { modals } from "common/modals";
import { packets } from "common/packets";
import { queries } from "common/queries";
import React, { useState, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { IconButton } from "renderer/basics/IconButton";
import { Modal } from "renderer/basics/Modal";
import { useSocket, useOptionalProfile } from "renderer/contexts";
import { DownloadsButton } from "renderer/Shell/DownloadsButton";
import { ProfileButton } from "renderer/Shell/ProfileButton";
import { SearchButton } from "renderer/Shell/SearchButton";
import { useListen } from "renderer/Socket";
import { useAsyncCb } from "renderer/use-async-cb";
import { useAsync } from "renderer/use-async";
import styled from "styled-components";

const TopbarDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  button.topbar-item {
    align-self: stretch;
    margin-right: 1em;

    border: none;
    border: 1px solid #444;

    background: none;
  }

  padding-bottom: 10px;
`;

const DraggableFiller = styled.div`
  -webkit-app-region: drag;
  align-self: stretch;
  flex-grow: 1;
`;

type PopoverName = "preferences" | "downloads" | null;

export const Topbar = () => {
  const socket = useSocket();
  const [maximized, setMaximized] = useState(false);
  const [popover, setPopover] = useState<PopoverName>(null);

  let [close] = useAsyncCb(async () => {
    await socket.query(queries.close);
  }, [socket]);

  let [preferences] = useAsyncCb(async () => {
    await socket.showModal(modals.preferences, {});
  }, [socket]);

  let [minimize] = useAsyncCb(async () => {
    await socket.query(queries.minimize);
  }, [socket]);

  let [toggleMaximized] = useAsyncCb(async () => {
    await socket.query(queries.toggleMaximized);
  }, [socket]);

  useAsync(async () => {
    const { maximized } = await socket.query(queries.isMaximized);
    setMaximized(maximized);
  }, [socket]);

  useListen(
    socket,
    packets.maximizedChanged,
    ({ maximized }) => {
      setMaximized(maximized);
    },
    []
  );

  const profile = useOptionalProfile();

  let onOpenPreferences = useCallback(() => {
    socket.showModal(modals.preferences, {}).catch(e => console.warn(e.stack));
  }, [socket]);

  return (
    <TopbarDiv className="topbar">
      {profile && (
        <ProfileButton profile={profile} openPreferences={onOpenPreferences} />
      )}
      {profile && <DownloadsButton />}
      {profile && <SearchButton />}
      <DraggableFiller
        onClick={() => console.log("draggable filler click")}
        onClickCapture={() => console.log("draggable filler click capture")}
      />
      <IconButton icon="cog" onClick={preferences} />
      <IconButton icon="window-minimize" onClick={minimize} />
      <IconButton
        icon={maximized ? "window-restore" : "window-maximize"}
        onClick={toggleMaximized}
      />
      <IconButton icon="cross" onClick={close} />
      <Popover name={popover} onClose={() => setPopover(null)} />
    </TopbarDiv>
  );
};

const Popover = (props: { name: PopoverName; onClose: () => void }) => {
  const socket = useSocket();
  const [switchLanguage] = useAsyncCb(
    async lang => {
      socket.query(queries.switchLanguage, { lang });
    },
    [socket]
  );

  const { name, onClose } = props;
  switch (name) {
    case "preferences":
      return (
        <Modal
          onClose={onClose}
          title={<FormattedMessage id="sidebar.preferences" />}
        >
          <p>Have some prefs!</p>
          <p>
            <button onClick={() => switchLanguage("fr")}>
              Switch to French
            </button>
          </p>
          <p>
            <button onClick={() => switchLanguage("en")}>
              Switch to English
            </button>
          </p>
        </Modal>
      );
    case "downloads":
      return (
        <Modal
          onClose={onClose}
          title={<FormattedMessage id="sidebar.downloads" />}
        >
          <p>Your downloads go here</p>
        </Modal>
      );
    case null:
      return null;
  }
};
