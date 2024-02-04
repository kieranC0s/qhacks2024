import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowRightCircle } from 'react-bootstrap-icons';
import mascot from "../assets/mascot.jpg";
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import '../style.css';

export const Banner = () => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(300 - Math.random() * 100);
  const toRotate = ["Welcome to iLearn!"]; // Add more items to rotate if needed
  const period = 2000;

  useEffect(() => {
    const tick = () => {
      let i = loopNum % toRotate.length;
      let fullText = toRotate[i];
      let updatedText = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1);
  
      setText(updatedText);
  
      if (isDeleting) {
        setDelta(prevDelta => prevDelta / 2);
      }
  
      if (!isDeleting && updatedText === fullText) {
        setIsDeleting(true);
        setTimeout(() => setDelta(period), period);
      } else if (isDeleting && updatedText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setDelta(500);
      }
    };
  
    let ticker = setInterval(tick, delta);
  
    return () => { clearInterval(ticker); };
  }, [delta, isDeleting, loopNum, text, toRotate, period]);


  const tick = () => {
    let i = loopNum % toRotate.length;
    let fullText = toRotate[i];
    let updatedText = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta(prevDelta => prevDelta / 2);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(period);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setDelta(500);
    }
  };

  return (
    <section className="banner" id="home">
      <Container>
        <Row className="aligh-items-center">
          <Col xs={12} md={6} xl={7}>
          <TrackVisibility>
            {({ isVisible }) =>
              <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                <div className="text-background"> {/* Add this line */}
                  <h1>{} <span className="txt-rotate" dataPeriod="1000" data-rotate='[ "Welcome to iLearn" ]'><span className="wrap">{text}</span></span></h1>
                  <p>Dive into a comprehensive suite of tools designed to enrich your learning journey. From insightful summaries to bespoke test creation and a wealth of resources, every path leads to new discoveries. Choose your next step:</p>
                </div> {/* Close the div here */}
                </div>}
          </TrackVisibility>
          </Col>
          <Col xs={12} md={6} xl={5}>
            <TrackVisibility>
              {({ isVisible }) =>
                <div className={isVisible ? "animate__animated animate__rubberBand" : ""}> 
                  <img src={mascot} alt="Mascot Img" style={{ width: '700px', height: 'auto', marginRight: '40px' }}/>
                </div>}
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
