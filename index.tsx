import React, { useState } from 'react'
import type { UploadProps } from 'antd'

import { message, Modal, Upload } from 'antd'
import Cropper from 'react-cropper'

import { CloseCircleTwoTone } from '@ant-design/icons'

import 'cropperjs/dist/cropper.css'
import styles from './index.module.scss'

type IProps = {
  // 自定义最外层样式
  style?: object
  // 未上传图片标题文本
  emptyTitle?: string
  // 上传按钮文本
  emptyBtnText?: string
  // 图片比例
  aspectRatio?: number
  // 确认回调
  onCropperOk: Function
  // 取消回调
  onCropperCancel?: Function
  // 删除回调
  onImageDel?: Function
}

const defaultRatio = 16 / 9

// github.com/fengyuanchen/cropperjs

export default (props: IProps) => {
  const [btnLoading, setBtnLoading] = useState<boolean>(false)
  const [visible, setVisible] = useState<boolean>(false)

  // 图片预览dataURL
  const [cropData, setCropData] = useState<any>('#')
  // cropper对象
  const [cropper, setCropper] = useState<any>()
  // cropper裁剪图片
  const [image, setImage] = useState<string | undefined>(undefined)

  const onModalOk = () => {
    if (image === undefined) return message.warn('请选择图片')
    setBtnLoading(true)
    cropper.getCroppedCanvas().toBlob(async (cropBlob) => {
      setCropData(cropper.getCroppedCanvas().toDataURL())
      props.onCropperOk(cropBlob)
      setBtnLoading(false)
      setImage(undefined)
      setVisible(false)
    })
  }

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const sizeLimit = file.size / 1024 / 1024 < 2
      if (!sizeLimit) {
        message.warn('最大支持上传文件大小为2M')
        return false
      }
      return sizeLimit
    },
    onChange: (info) => {
      setVisible(true)
      const fileObj: any = info.fileList[0].originFileObj
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as any)
      }
      reader.readAsDataURL(fileObj)
    },
  }

  const onDelImage = (e) => {
    e.stopPropagation()
    setCropData('#')
    setImage(undefined)
    props.onImageDel && props.onImageDel()
  }

  return (
    <>
      <Upload action='' maxCount={1} showUploadList={false} accept='.png, .jpg, .jpeg' {...uploadProps}>
        <div
          style={props.style}
          className={`${styles['cropper-wrap']} ${styles['cropper-center']} ${
            cropData === '#' && styles['cropper-wrap-hover']
          }`}
        >
          {cropData !== '#' ? (
            <>
              <div className={styles['cropper-del']} onClick={onDelImage}>
                <CloseCircleTwoTone style={{ fontSize: '16px' }} twoToneColor={'#E02020'} />
              </div>
              <img style={{ width: '100%' }} src={cropData} alt='cropped' />
            </>
          ) : (
            <div className={styles['cropper-empty-wrap']}>
              {props.emptyTitle && <div className={styles['cropper-empty-title']}>{props.emptyTitle}</div>}
              <div className={styles['cropper-empty-btn']}>{props.emptyBtnText ? props.emptyBtnText : '上传图片'}</div>
            </div>
          )}
        </div>
      </Upload>

      <Modal
        title='图片裁剪'
        visible={visible}
        width='700px'
        maskClosable={false}
        destroyOnClose
        onOk={onModalOk}
        confirmLoading={btnLoading}
        onCancel={() => {
          setVisible(false)
          setImage(undefined)
          props.onCropperCancel && props.onCropperCancel()
        }}
      >
        <>
          <div className={styles['cropper-area']}>
            <Cropper
              style={{ height: 400, width: '100%' }}
              initialAspectRatio={props.aspectRatio ? props.aspectRatio : defaultRatio}
              aspectRatio={props.aspectRatio ? props.aspectRatio : defaultRatio}
              src={image}
              viewMode={2}
              background={false}
              responsive={true}
              autoCropArea={1}
              cropBoxResizable={true}
              checkOrientation={false}
              onInitialized={(instance) => {
                setCropper(instance)
              }}
              guides={true}
            />
          </div>
        </>
      </Modal>
    </>
  )
}
