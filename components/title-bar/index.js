import styled from 'styled-components'

export default props => (
  <Box>
    {props.title}
    <Alert {...props} onClick={() => props.click()}>
      {' '}
      Change Stream{' '}
    </Alert>
  </Box>
)

const Logo = styled.img`
  width: 35px;
  height: 35px;
  margin-right: 1rem;
`

const Alert = styled.div`
  cursor: pointer;
  margin: 0rem 1.5rem;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  color: white;
  background: ${props => (props.connected ? '#28bebd' : '#9e9e9e')};
  @media screen and (max-width: 800px) {
    margin-top: 20px;
  }
`

const Box = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #222;
  background: white;
  width: 100%;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  font-size: 20px;
  @media screen and (max-width: 800px) {
    flex-direction: column;
  }
`
