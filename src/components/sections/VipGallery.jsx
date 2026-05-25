export default function VipGallery() {
  return (
    <section className="py-24 px-6 bg-background-dark">

      <div className="max-w-7xl mx-auto text-center mb-16">

        <h3 className="text-4xl md:text-6xl font-black text-white italic uppercase mb-4">
          Galería VIP
        </h3>

        <p className="text-slate-400 max-w-xl mx-auto">
          Un vistazo a la atmósfera exclusiva que espera a quienes se atreven a cruzar el umbral.
        </p>

      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">

        {[
          "AB6AXuDAP_4L_2eZW0okRUn1L8YvsRsjwDNFcQ6WIU8Sfds0VtzyrfHbyJ1Ff2fR7chNyYxtom1VHVIa26O6DVol5Ik6HYG4lmEjB6Zsae9U8w8TqbZo2A9NcqMb-0dB5TnIhIAH3Zh8xz1Ul1amUb0vmlPiPNmXd-AhjSH1lQAfsgMxUPcRygmyEtxn7zXWkuQB0uaXcEHOBIbhm3WjbsKxjXY0bGuw5piX9X7b3wiJENritU1ioLodJ0UEBV84c5QCeXc9-J7yoejVRtUY",
          "AB6AXuA4jOwGFFo2gIajxICC4peWa2xBfo5WvflZH1dP72T_jpgzoQGsT0hIoO-cPaRfsWus5v9ugfMSe2tTXnvnttQLpFZLVecuigAviYTcqVRNS_kEUBzLu_tD636rZH-y4CBwIjF6yaT0Va2i-XilzZRW1ve1qARdgolQncsu2sy6EdgnWy_7U1E301lJAytZb3tnvG_ovLIq_iJnKB5a-3Mg8DuWgggzn6QknAVSCMDn5cqwomZFa_TJ_iJIjSaYedeS9ndL6lKWmQ_7",
          "AB6AXuAl3b2lCvugRivC225walTXe1q-3gFSUw7FVu3HY4SIIsZm6fZrcHKBT0fU4TDDbYoyoWOsfAIQd1fFpJsRVU8BcNU4VXWH-q7Dr00bcgCcDzEkv_tvWqYeuu1UZh0lA92xwjsRt8ateef-jA6oGNB8i9epxyjt4Lx2juBY7aiNvcZxU0COV6GF8K2y7irEmJyyHY5a7y9g1Vvp9o1_I6LpMXfTGH1UywXZZwJysajtU8OZCeVqWceL5lg-2v-xQNpNCHV15LJiLbFi",
          "AB6AXuDkwcASbM01Gdn9aUFFd2OAGpd7z2MmS8kxBiz5lsR2h0h53pdVRvpY3C-TTwBWFysIEEhzTzTJaNZSp1HnHYYhlCQzyiCLIfSx0OvpnmJJnzFEvyiOwS1xMJG0tpztrLoW9CG1VLB9hAmhrJraTHye1ExCobKYgEBwuTe_mfyxjEXfnv9gXxaM6fDQA35KeZiwRT57VhTP8L8bed771d7gAIhyZWedFS4S8px0YTSWgnYPUrnJFTQ3X5c-zs5x6fThHhZ5Lb0gS0o6",
          "AB6AXuD-cK58dnEAlkcfPze5BNKFR9IhdSPv46A7m_GbXAW8OxvQCNC3QexjNRycSrtrpAWjEnJyRGTcuuKalv6h23aMpgtQQeJ5EBwqqQu80apf8biduvgI9NpVYfqhKo-QQhyfvqk5mZ7R90GIpqAkghqNnJ4UflVjMXm-aRp7of0B7pU-2Pu6UAuipMXGn-K19FinS6Cr8AJZQ340gRAO2kvNJS3UwSRelBLq012c2qO0p4dVennqqP0eZbWi5CwO7VAVlwg69UyKLT7r",
          "AB6AXuD7-HwFcn6IRHlfa6_rYKMb--eSCtcA0hG3VUi_7gX3Z1KePvjQ8WMc1xb2ghHxL0JsxktSceIUBWLhkHwFUhKb3at_Nq87w1jo1upP9DGgr2P-cFamknhlECJDwf9-8WG2nWxvy7vhYErPCto1mFZo755pBSwtMJ_OVfL1ZRZwlXENMAEfH8BZ_9liXv4WtNVw4tpWZDE0a1pQfln29tdgFUSBtl7YRBMAMwnPpqVeedAIr1ELomNXITHSyuM42HniHJn1p4OApUf6"
        ].map((img, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-white/5">
            <img
              className="w-full hover:opacity-80 transition-opacity"
              src={`https://lh3.googleusercontent.com/aida-public/${img}`}
            />
          </div>
        ))}

      </div>
    </section>
  )
}
