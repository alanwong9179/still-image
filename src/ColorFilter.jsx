import React, { useState, useEffect, useRef } from 'react'
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
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  backgroundColor: color.main,
})

const ImageContainer = styled(Box)({
  flex: 8,
  borderBottom: '3px solid #e1e1e1;',
  zIndex: 10,
  display: 'flex',
  alignItems: 'center'
})

const ToolsContainer = styled(Box)({
  flex: 1,
  backgroundColor: color.light1,
  padding: 10
})

function ColorFilter() {
  const [canvas, setCanvas] = useState('');
  const [uploadedImg, setUploadedImg] = useState(null)
  const imageRef = useRef(null)
  const [imgContainerRef, imgContainerBounds] = useMeasure()
  const [openNewDialog, setOpenNewDialog] = useState(false)

  const [filterInfo, setFilterInfo]  = useState(null)


  useEffect(() => {
    setOpenNewDialog((uploadedImg === null))
  }, [uploadedImg])

  const initCanvas = (w, h) => (
    new fabric.Canvas('canvas', {
      height: h,
      width: w,
      backgroundColor: '#FFFFFF'
    })
  );

  useEffect(() => {
    uploadedImg !== null &&
      loadImage()
  }, [uploadedImg])

  useEffect(() => {
    if (canvas !== '') {
      canvas.add(imageRef.current).renderAll();
      let containerWidth = imgContainerBounds.width;
      let containerHeight = imgContainerBounds.height;

      let scaleRatio = Math.min(containerWidth / imageRef.current.width, containerHeight / imageRef.current.height);

      console.log(scaleRatio)

      canvas.setDimensions({ width: canvas.getWidth() * scaleRatio, height: canvas.getHeight() * scaleRatio });
      canvas.setZoom(scaleRatio)
    }

  }, [canvas])

  const loadImage = () => {

    fabric.Image.fromURL(uploadedImg, (oImg) => {
      let imgWidth = oImg.width;
      let imgHeight = oImg.height;

      imageRef.current = oImg
      setCanvas(initCanvas(imgWidth, imgHeight))


      oImg.set({
        selectable: false,
      })
    }, { crossOrigin: 'Anonymous' })
  }

  const onChangeFilter = () => {
     // fabric.textureSize = 4096
    setFilterInfo(
      new fabric.Image.filters.ColorMatrix({
        matrix: [
          1, -0.1, 0.023, 0, 0,
          0, 1, 0.023, 0.023, 0,
          0, 0, 1, 0, 0,
          0, 0, 0, 1, 0
        ]
      })
    )
    let img = imageRef.current

    img.filters.push(
      new fabric.Image.filters.ColorMatrix({
        matrix: [
          1, -0.1, 0.023, 0, 0,
          0, 1, 0.023, 0.023, 0,
          0, 0, 1, 0, 0,
          0, 0, 0, 1, 0
        ]
      })
    )

    img.applyFilters()
    canvas.renderAll()
  }

  const saveImage = async () => {
    fabric.Image.fromURL(uploadedImg, function (oImg) {

      let fullCanvas = new fabric.Canvas('fullcanvas', {
        height: oImg.height,
        width: oImg.width
      })
      
      if(filterInfo !== null){
        oImg.filters.push(filterInfo)
      }
      oImg.applyFilters()
      fullCanvas.add(oImg).renderAll()
      let outputImageURL = fullCanvas.toDataURL({
        format: 'jpeg',
        quality: 1,
      })

      window.ReactNativeWebView.postMessage(outputImageURL);


    }, { crossOrigin: 'Anonymous' })
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


  return (
    <MainContainer className='mainContainer'>
      <ImageContainer ref={imgContainerRef} >
        <Box width={'100%'}>
          <canvas id="canvas" />
        </Box>

        <Box style={{ display: 'none' }}>
          <canvas id="fullcanvas" />
        </Box>
      </ImageContainer>
      <ToolsContainer>
        <button onClick={() => { saveImage() }}>save</button>
        <button onClick={() => { onChangeFilter() }}>color</button>
      </ToolsContainer>
      <NewImageDialog open={openNewDialog} onUpload={onUpload} />
      <button onClick={() => { location.reload() }}>change</button>
    </MainContainer>
  )
}

export default ColorFilter
