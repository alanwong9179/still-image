import  React, { useState, useEffect, useRef} from 'react'
import { fabric } from 'fabric';
import { styled } from '@mui/material';
import { Box } from '@mui/system';
import color from './color/palettes';
import useMeasure from 'react-use-measure';
import ImageDownloader from './functions/ImageDownloader';
import ScaleSlider from './widgets/ScaleSlider';
import NewImageDialog from './widgets/NewImageDialog';
import Div100vh from 'react-div-100vh'

const MainContainer = styled(Div100vh)({
  display:'flex',
  flexDirection:'column',
  width:'100%',
  backgroundColor: color.main,
})

const ImageContainer = styled(Box)({
  flex: 3,
  borderBottom: '3px solid #e1e1e1;',
  zIndex: 10
})

const ToolsContainer = styled(Box)({
  flex: 1,
  backgroundColor: color.light1,
  padding: 10
})

function App() {
  const [canvas, setCanvas] = useState('');
  const [info, setInfo] = useState({imgW:0, imgH:0, OgW:0, OgH:0, cWidth:0, cHeight:0, firstImgH:0, firstImgW:0})
  const [uploadedImg, setUploadedImg] = useState(null)
  const imageRef = useRef(null)
  const [imgContainerRef, imgContainerBounds] = useMeasure()
  const [imageContainerSize, setImageContainerSize] = useState({top: 0, left: 0, isSet: false})
  const [openNewDialog, setOpenNewDialog] = useState(false)

  useEffect(() => {
     setOpenNewDialog((uploadedImg === null))
  },[uploadedImg])

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
       backgroundColor: '#FFFFFF'
    })
 );

   const loadImage = () => {
    //init
    let imgW, imgH, firstImgW, firstImgH, OgW, OgH = 0

    fabric.Image.fromURL(uploadedImg, (oImg) => {

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
    img.scale(scaleValue).setCoords();

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

   const saveImage = async () => {
    let fullResScale = 0

    if(info.OgH === 0) {
      fullResScale = info.OgW / info.firstImgW
    }else{
      fullResScale = info.OgH / info.firstImgH
    }
    let fullCanvas = new fabric.Canvas('fullcanvas', {
      backgroundColor: '#ffffff',
      width: fullResScale * info.cWidth,
      height: fullResScale * info.cHeight,
      display:'none'
    })
    fabric.Image.fromURL(uploadedImg, function (oImg){
      console.log(oImg)
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
      let outputImageURL = fullCanvas.toDataURL({
        format: 'jpeg',
        quality: 1,
      })
  
      console.log(outputImageURL)
      ImageDownloader(outputImageURL)
    }, {crossOrigin:'Anonymous'})
    


 
   }

   const onUpload = (element) => {
    let uploadedImg = element.target.files[0]
    let reader = new FileReader()
    reader.onload = ((img) => {
      let data = img.target.result 
      setUploadedImg(data) // trigger useEffect loadimage
    })
    reader.readAsDataURL(uploadedImg)
   }

   useEffect(() => {
    uploadedImg !== null &&
      loadImage()
   }, [uploadedImg])

   useEffect(() => {
    /* relocate canvas */
    if (imgContainerBounds.width !== 0 && !imgContainerBounds.isSet){
      setImageContainerSize({
        top: (imgContainerBounds.height / 2 ) - (info.cHeight / 2),
        isSet: true
      })
    }
   }, [imgContainerBounds.width])

    const changeBgColor = () => {
      console.log(imageRef.current)
      console.log(parseFloat(imageRef.current.scaleX).toFixed(2))
      canvas.backgroundColor = '#2200ff'
      scaleImage(parseFloat(imageRef.current.scaleX).toFixed(2))

    }



  return (
   <MainContainer className='mainContainer'>
      <ImageContainer ref={imgContainerRef} >
      <canvas id="canvas" style={{top: imageContainerSize.top}}/>
      <Box style={{display:'none'}}>
      <canvas id="fullcanvas"/>
      </Box>
    </ImageContainer>
    <ToolsContainer>
      {
        imageRef.current !== null &&
        <ScaleSlider onScale={scaleImage} currentScale={imageRef.current !== null ? parseFloat(imageRef.current.scaleX).toFixed(2) : 1}/>

      }
          <button onClick={()=>{saveImage()}}>save</button>
    </ToolsContainer>
    <NewImageDialog open={openNewDialog} onUpload={onUpload} />
    <button onClick={()=>{changeBgColor()}}>change</button>
    </MainContainer>
  )
}

export default App
