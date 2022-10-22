import  React, { useState, useEffect, useRef} from 'react'
import { fabric } from 'fabric';


function App() {

  const [canvas, setCanvas] = useState('');
  const [info, setInfo] = useState({imgW:0, imgH:0, OgW:0, OgH:0, cWidth:0, cHeight:0, firstImgH:0, firstImgW:0})
  const imageRef = useRef(null)
  
  console.log(canvas)

  useEffect(() => {
    initValue(), 
    () => {
      setInfo({imgW:0, imgH:0, OgW:0, OgH:0, cWidth:0, cHeight:0, firstImgH:0, firstImgW:0})
    }
  },[])

  const initValue = () => {
    let cWidth = window.innerWidth * 0.9
    let cHeight = ( 5 * cWidth ) / 4 // 4:5
    setInfo({...info, cWidth: cWidth, cHeight: cHeight}) //will trigger useEffect to init canvas
  }

  useEffect(() => {
    ( info.cHeight !== 0 && info.cWidth !== 0 ) &&
    setCanvas(initCanvas())
  }, [info.cHeight, info.cWidth])

  const initCanvas = () => (
    new fabric.Canvas('canvas', {
       height: info.cHeight,
       width: info.cWidth,
       backgroundColor: 'pink'
    })
 );

   const loadImage = () => {
    //init
    let imgW, imgH, firstImgW, firstImgH, OgW, OgH

    fabric.Image.fromURL('https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png', (oImg) => {

      if (oImg.width >= oImg.height) {
        OgW = oImg.width
        oImg.scaleToWidth(info.cWidth);
      }else{
        OgH = oImg.height
        oImg.scaleToHeight(info.cHeight);
      }

      imgW = info.cWidth 
      imgH = info.cHeight
      firstImgW = info.cWidth
      firstImgH = info.cHeight

      oImg.set({
        left:  info.cWidth/2 - oImg.getScaledWidth()/2,
        top:  info.cHeight/2 - oImg.getScaledHeight()/2,
        selectable: false,
      })

      imageRef.current = oImg
      canvas.add(oImg).renderAll();

      setInfo({...info, imgW: imgW, imgH: imgH, firstImgH: firstImgH, firstImgW: firstImgW, OgW: OgW, OgH: OgH})
    }, {crossOrigin:'Anonymous'})
   }

   const scaleImage = (scaleValue) => {
    let img = imageRef.current
    img.scale(parseFloat(scaleValue) * 0.005).setCoords();
    
    let scaledW = img.getScaledWidth()
    let scaledH = img.getScaledHeight()
    setInfo({...info, imgW: scaledW, imgH: scaledH})

    img.set({
      left:  info.cWidth/2 - scaledW/2,
      top:  info.cHeight/2 - scaledH/2,
      selectable: false,
    })

    canvas.renderAll()
   }

   const saveImage = () => {
    let fullResScale = 0
    console.log(info.OgH, info.OgW)
    if(info.OgH === 0) {
      fullResScale = info.OgW / info.firstImgW
    }else{
      fullResScale = info.OgH / info.firstImgH
    }

    console.log(fullResScale)

    let fullCanvas = new fabric.Canvas('fullcanvas', {
      backgroundColor: '#ffffff',
      width: fullResScale * info.cWidth,
      height: fullResScale * info.cHeight
    })

    fabric.Image.fromURL('https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png', function (oImg){
      if (oImg.width >= oImg.height) {
        oImg.scaleToWidth(fullResScale * info.imgW);
      }else{
        oImg.scaleToHeight(fullResScale * info.imgW);
      }
  
      oImg.set({
        left:  fullResScale * info.cWidth/2 - oImg.getScaledWidth()/2,
        top:  fullResScale * info.cHeight/2 - oImg.getScaledHeight()/2,
        selectable: false,
      })
  
      fullCanvas.add(oImg).renderAll();
    }, {crossOrigin:'Anonymous'})
    
    let outputImageURL = canvas.toDataURL({
      format: 'jpeg',
      quality: 1,
    })

    console.log(outputImageURL)

   }



  return (
   <div>
    <canvas id="canvas" />
    <canvas id="fullcanvas" style={{display:'none'}}/>
    <input type={"range"} onInput={(e)=>{scaleImage(e.target.value)}}></input>
    <button onClick={()=>{loadImage()}}>load</button>
    <button onClick={()=>{saveImage()}}>save</button>
   </div>
  )
}

export default App
