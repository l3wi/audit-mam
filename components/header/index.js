import styled from "styled-components"

export default props => <Head>Audit Trail - Dashboard</Head>

const Logo = styled.img`
  width: 35px;
  height: 35px;
  margin-right: 1rem;
`

const Head = styled.header`
  position: fixed;
  top: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: white;
  background: #1d75bc;
  height: 65px;
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
  z-index: 99;
`
