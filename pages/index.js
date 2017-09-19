import React from "react"
import styled from "styled-components"
import ChartistGraph from "react-chartist"
import { init, fetchMAMs, publishMAM, channelkey, newSub } from "../libs/mam.js"
import { seedGen, utils } from "../libs/utils"

import Layout from "../components/layout"
import TitleBar from "../components/title-bar"
import Audit from "../components/audit"

import { format } from "date-fns"

const lineChartData = {
  labels: [1, 2, 3, 4, 5, 6, 7, 8],
  series: [[5, 9, 7, 8, 5, 3, 5, 4]]
}

const lineChartOptions = {
  low: -65,
  showArea: true,
  axisX: {
    labelInterpolationFnc: function(value) {
      // Will return Mon, Tue, Wed etc. on medium screens
      return format(value, "hh:mm:ss")
    }
  }
}

const pieData = {
  series: [60, 40]
}

const pie = {
  donut: true,
  donutWidth: 60,
  startAngle: 270,
  total: 245 * 2,
  showLabel: false
}
export default class extends React.Component {
  state = {
    messages: [],
    lineChartData: {
      labels: [],
      series: [[]]
    },
    pieData: {
      series: [122, 123]
    },
    input: "",
    userId: "",
    channel: "",
    temperature: 23,
    gradient: 50,
    mam: {},
    counter: 0
  }

  async componentDidMount() {
    // Make a seed for the user
    var seed = await localStorage.getItem("seed")
    console.log(seed)
    if (!seed) {
      seed = seedGen(81)
      localStorage.setItem("seed", seed)
    }
    // Initalise MAM using the seed
    var mam = init(seed)
    // Save MAM and set user ID as it's channel key
    this.setState({ mam, userId: mam.channelKey, seed })
    // Get the contents of the channel
    this.getChannel(mam)
  }

  getChannel = async mam => {
    var messages = []
    // Loop through subscribed channels
    for (var key in mam.subscribed) {
      var state = await fetchMAMs(mam, key, function(inital, data) {
        if (!inital) {
          console.log("MESSAGE DATA: ", data)
          messages.push(JSON.parse(data.message))
        } else {
          console.log(inital)
        }
      })
    }

    var txs = JSON.parse(await localStorage.getItem("txs"))
    txs.map((tx, i) => (messages[i].tx = tx))
    // Fill the chart from retrieved data
    var lineChartData = this.state.lineChartData
    messages.map(msg => {
      lineChartData.labels.push(msg.timestamp)
      lineChartData.series[0].push(msg.temperature)
    })

    this.setState({ messages, lineChartData })
    return
  }

  sendMessage = async () => {
    this.setState({ loading: true }, async () => {
      // Message construction
      var messages = this.state.messages
      var packet = {
        temperature: this.state.temperature,
        gradient: this.state.gradient,
        timestamp: Date.now(),
        time: this.state.time
      }

      var resp = await publishMAM(this.state.mam, JSON.stringify(packet))
      console.log(resp.tx)
      console.log(resp.state)
      // Counter
      // Add bundle hash
      packet.tx = resp.tx[1].hash
      messages.push(packet)

      /// Adjust line chart
      var lineChartData = this.state.lineChartData
      lineChartData.labels.push(Date.now())
      lineChartData.series[0].push(this.state.temperature)

      // Adjust temp guage
      var pieData = this.state.pieData
      pieData.series = [
        parseInt(this.state.temperature) + 65,
        180 - parseInt(this.state.temperature)
      ]

      // Incriment the counter
      var counter = this.state.counter + 1

      var txHashes = JSON.parse(await localStorage.getItem("txs")) || []
      txHashes.push(resp.tx[1].hash)
      localStorage.setItem("txs", JSON.stringify(txHashes))

      // Return the state
      this.setState({
        messages,
        counter,
        lineChartData,
        pieData,
        loading: false
      })
    })
  }

  handleChange = (e, name) => {
    var state = {}
    state[name] = e.target.value
    this.setState(state)
  }

  render() {
    var { messages, counter, loading } = this.state
    return (
      <Layout>
        <TitleBar
          title={`Fictional Temperature controlled unit.`}
          connected={true}
        />
        {/* FIRST ROW OF BOXES */}
        <Row>
          {/* FIRST CARD */}
          <Card>
            <Block>Temperature</Block>

            <ChartistGraph
              style={{ height: 300, marginBottom: -100 }}
              data={this.state.pieData}
              options={pie}
              type={"Pie"}
            />
            <Temperature>
              {messages[messages.length - 1] ? (
                `${messages[messages.length - 1].temperature}°`
              ) : (
                `--`
              )}
            </Temperature>

            <Block top>
              <Items>
                Current time:{" "}
                <Value>
                  {messages[messages.length - 1] ? (
                    messages[messages.length - 1].time
                  ) : (
                    "No time"
                  )}
                </Value>
              </Items>
              <Items>
                Commands sent: <Value>{counter}</Value>
              </Items>
            </Block>

            <Block top>
              <div>Last command:</div>
              <Command> > Set Uhrzeit </Command>
            </Block>
          </Card>

          <Card flex={1.6}>
            <Block>Historical Temperature</Block>
            <ChartistGraph
              data={this.state.lineChartData}
              options={lineChartOptions}
              type={"Line"}
            />
            <Block>Control options</Block>
            <Block>
              <span>Temperature</span>
              <Slider
                id="typeinp"
                type="range"
                min="-65"
                max="180"
                value={this.state.temperature}
                onChange={e => this.handleChange(e, "temperature")}
                step="1"
              />
              <TinyRick>
                <span>-65</span>
                <span>{this.state.temperature}</span>
                <span>180</span>
              </TinyRick>
              <span>Gradient</span>
              <Slider
                id="typeinp"
                type="range"
                min="0"
                max="100"
                value={this.state.gradient}
                onChange={e => this.handleChange(e, "gradient")}
                step="1"
              />
              <TinyRick>
                <span>0</span>
                <span>{this.state.gradient}</span>
                <span>100</span>
              </TinyRick>
            </Block>

            <Block>
              <Row>
                <Input
                  placeholder={`Enter time: 1:31:01`}
                  value={this.state.time}
                  onChange={e => this.handleChange(e, "time")}
                />
                <Button
                  loading={loading}
                  onClick={() => (loading ? null : this.sendMessage())}
                >
                  {loading ? "Attaching Log..." : "Send Command"}
                </Button>
              </Row>
            </Block>
          </Card>
        </Row>
        {/* SECOND ROW OF BOXES */}
        <Row>
          <Card>
            <Block>Audit Trail</Block>
            <Audit messages={messages} />
          </Card>
        </Row>
      </Layout>
    )
  }
}

const Temperature = styled.h2`
  position: absolute;
  width: 50px;
  left: calc(50% - 25px);
  top: 160px;
  font-size: 36px;
  text-align: center;
`

const Button = styled.button`
  flex: 1;
  height: 45px;
  padding: 10px;
  background: ${props => (props.loading ? "grey" : "#1d75bc")};
  border: none;
  color: white;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  margin: 1rem 1rem 0;
  &:active {
    outline: none;
    opacity: 0.6;
  }
  &:focus {
    outline: none;
  }
`

const TinyRick = styled.div`
  font-size: 9px;
  display: flex;
  justify-content: space-between;
`
const Items = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const Value = styled.span`
  color: #516073;
  font-weight: 700;
  font-size: 22px;
  margin: 10px;
`

const Command = styled.div`
  flex: 1;
  background: #eee;
  border-radius: 8px;
  border: none;
  font-weight: 400;
  font-family: monospace;
  font-size: 18px;
  margin: 10px 0;
  padding: 8px 10px;
  &:focus {
    outline: none;
  }
`

const Input = styled.input`
  flex: 1.5;
  border: none;
  border-bottom: 2px solid #1d75bc;
  font-size: 18px;
  margin: 10px 0;
  padding: 8px 10px;
  &:focus {
    outline: none;
  }
`

const Slider = styled.input`min-height: 30px;`

const Card = styled.div`
  position: relative;
  margin: 1rem 1rem;
  background: white;
  flex: ${props => (props.flex ? props.flex : 1)};
`

const Block = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-top: ${props => (props.top ? "1px solid rgba(0,0,0,0.1)" : null)};
`

const Row = styled.section`
  width: 100%;
  display: flex;
  flex-direction: row;
  @media screen and (max-width: 800px) {
    flex-direction: column;
  }
`
