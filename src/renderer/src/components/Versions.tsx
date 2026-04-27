interface ProcessVersions {
  electron?: string;
  chrome?: string;
  node?: string;
}

export const Versions = (): React.JSX.Element => {
  const versions: ProcessVersions = window.electron?.process?.versions || {}

  return (
    <ul className="versions">
      <li className="electron-version">Electron v{versions.electron || 'unknown'}</li>
      <li className="chrome-version">Chromium v{versions.chrome || 'unknown'}</li>
      <li className="node-version">Node v{versions.node || 'unknown'}</li>
    </ul>
  )
}

export default Versions
