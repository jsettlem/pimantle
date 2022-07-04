function ServerPanel({
  socketState,
  playersOnline,
  socketDisconnectCallback,
}: {
  socketState: string;
  playersOnline: number;
  socketDisconnectCallback: () => void;
}) {
  return (
    <div className="server-panel">
      {socketState === "connected" && (
        <>
          <span
            className="player-count"
            title="Players online solving this puzzle"
          >
            👤{playersOnline}
          </span>
          <input
            type="button"
            className="disconnect-button"
            value="Disconnect"
            onClick={socketDisconnectCallback}
          />
        </>
      )}
      {socketState === "connecting" && (
        <span className="reconnecting">Connecting...</span>
      )}

      {socketState === "closed" && (
        <input
          type="button"
          className="disconnect-button"
          value="Reconnect"
          onClick={() => {
            localStorage.removeItem("pimantle-offline");
            setTimeout(() => {
              window.location.reload();
            }, 150);
          }}
        />
      )}
    </div>
  );
}

export default ServerPanel;
