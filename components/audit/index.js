import styled from 'styled-components'
import { format } from 'date-fns'
export default props => (
  <AuditBox>
    {props.messages.map(log => (
      <a
        key={log.ts}
        href={`https://testnet.thetangle.org/transaction/${log.tx}`}
        target="_blank"
      >
        <Log>
          {' '}
          <span>{format(log.ts, 'HH:mm:ss')}</span>
          <span>{`Temperature: ${log.t}`}</span>
          <span>{`Gradient: ${log.g}`}</span>
          {/* <span>
            {log.time ? `Time was set: ${log.time}` : "Time was not set"}
          </span> */}
        </Log>
      </a>
    ))}
    {!props.messages[0] && (
      <Log>
        <span>{`No messages yet`}</span>
      </Log>
    )}
  </AuditBox>
)

const Log = styled.span`
  font-family: monospace;
  opacity: ${props => (props.pending ? 0.6 : 1)};
  margin: 0.3rem 0;
  padding: 0 0 0.5rem;
  font-size: 14px;
  width: 100%;
  display: flex;
  flex-direction: row;
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  justify-content: space-around;
  @media screen and (max-width: 800px) {
    font-size: 12px;
    flex-wrap: wrap;
  }
`

const AuditBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem 1.5rem;
  border-top: ${props => (props.top ? '1px solid rgba(0,0,0,0.1)' : null)};
`
