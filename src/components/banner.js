import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowRightCircle } from 'react-bootstrap-icons';
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import '../style.css';

export const Banner = () => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(300 - Math.random() * 100);
  const toRotate = ["Computer Engineer"]; // Add more items to rotate if needed
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
        <Row className="align-items-center">
          <Col xs={12} md={12}>
            <TrackVisibility>
              {({ isVisible }) =>
                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                  <span className="tagline">Welcome to iLearn</span>
                  <h1>{`Your AI-enhanced learning platform`}</h1>
                  <p>Here at iLearn, we provide you with cutting-edge tools to enhance your studying. From summarizing notes to preparing for exams with mock tests, we make sure you have the best support for your learning journey.</p>
                  <button onClick={() => console.log('connect')}>Explore Now <ArrowRightCircle size={25} /></button>
                </div>}
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
