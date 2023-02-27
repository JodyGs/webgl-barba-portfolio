import * as THREE from 'three'
import ASScroll from '@ashthornton/asscroll'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import testTexture from '../img/texture.jpg'
import * as dat from 'dat-gui'
import gsap from 'gsap'

export default class Sketch {
  constructor(options) {
    this.container = options.domElement;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 10, 1000);
    this.camera.position.z = 600;
    this.camera.fov = (Math.atan((this.height / 2) / 600) * 180 / Math.PI) * 2;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.asscroll = new ASScroll()

    this.asscroll.enable({
      horizontalScroll: true
    })
    this.time = 0;
    this.materials = []
    this.setUpSettings()
    this.resize()
    this.addObjects()
    this.render()
    this.setupResize()
  }

  setUpSettings() {
    this.settings = {
      progress: 0
    }
    this.gui = new dat.GUI()
    this.gui.add(this.settings, "progress", 0, 1, 0.001);
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  addObjects() {
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    this.material = new THREE.ShaderMaterial(
      {
        // wireframe: true,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
          uTime: { value: 1 },
          uProgress: { value: 0 },
          uTexture: { value: new THREE.TextureLoader().load(testTexture) },
          uTextureSize: { value: new THREE.Vector2(100, 100) },
          uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
          uResolution: { value: new THREE.Vector2(this.width, this.height) },
          uQuadSize: { value: new THREE.Vector2(300, 300) }
        }
      }
    );

    this.tl = gsap.timeline()
      .to(this.material.uniforms.uCorners.value, {
        x: 1,
        duration: 1
      })
      .to(this.material.uniforms.uCorners.value, {
        y: 1,
        duration: 1
      }, 0.1)
      .to(this.material.uniforms.uCorners.value, {
        z: 1,
        duration: 1
      }, 0.2)
      .to(this.material.uniforms.uCorners.value, {
        w: 1,
        duration: 1
      }, 0.5)

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(300, 300, 1)
    // this.scene.add(this.mesh);
    this.mesh.position.x = 300

    this.images = [...document.querySelectorAll('.js-image')];
    this.imageStore = this.images.map(img => {
      let bounds = img.getBoundingClientRect();
      let m = this.material.clone()
      this.materials.push(m);
      let texture = new THREE.Texture(img);
      texture.needsUpdate = true;

      m.uniforms.uTexture.value = texture;

      let mesh = new THREE.Mesh(this.geometry, m)
      this.scene.add(mesh);
      mesh.scale.set(bounds.width, bounds.height, 1)

      return {
        img: img,
        mesh: mesh,
        width: bounds.width,
        height: bounds.height,
        top: bounds.top,
        left: bounds.left,
      }
    })
  }

  setPosition() {
    this.imageStore.forEach(obj => {
      obj.mesh.position.x = -this.asscroll.currentPos + obj.left - this.width / 2 + obj.width / 2
      obj.mesh.position.y = -obj.top + this.height / 2 - obj.height / 2
    })
  }

  render() {
    this.time += 0.05
    this.material.uniforms.uTime.value = this.time
    this.setPosition()
    this.material.uniforms.uProgress.value = this.settings.progress
    this.tl.progress(this.settings.progress)
    this.mesh.rotation.x = this.time / 2000;
    this.mesh.rotation.y = this.time / 1000;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({ domElement: document.getElementById('container') })