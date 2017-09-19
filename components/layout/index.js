import styled from "styled-components"
import Header from "../header"

export default props => (
  <Main>
    <Header />
    <Float>{props.children}</Float>
  </Main>
)

const Float = styled.div`
  box-sizing: border-box;
  padding-top: 65px;
  display: flex;
  flex-direction: column;
  max-width: 80rem;
  width: 100%;
  margin: 0 auto;
`

const Main = styled.section`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  background: rgba(179, 212, 252, 0.3);
`
